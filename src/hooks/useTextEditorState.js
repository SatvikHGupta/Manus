import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore, useCurrentPage, useSettings } from '../store/index.js';
import { useDebounce } from './useDebounce.js';
import { applySmartQuotes } from '../utils/text/smart-quotes.js';
import { getTagSuggestions } from '../utils/text/tag-parser.js';
import { getCaretCoordinates } from '../utils/text/caretPosition.js';
import { activeTextareaRef } from '../utils/activeTextareaRef.js';
import { useSpeechToText } from './useSpeechToText.js';

// All the editing "brain" previously baked directly into TextEditor.jsx:
// debounced commits, the pendingWriteRef typing-bug fix, smart quotes,
// tag-suggestion detection/insertion, and voice-result insertion. Pulled
// out into a hook so the mobile composer can reuse this exact
// (already-debugged) logic instead of a parallel reimplementation that
// could silently reintroduce the typing bug this was written to fix.
export function useTextEditorState() {
  const page = useCurrentPage();
  const settings = useSettings();
  const updatePageText = useStore(s => s.updatePageText);
  // Wrapping updatePageText (rather than passing it straight to useDebounce)
  // lets us know the moment the debounced write actually LANDS, not just
  // when it's scheduled - see pendingWriteRef below.
  const commitPageText = useCallback((val) => {
    updatePageText(val);
    pendingWriteRef.current = false;
  }, [updatePageText]);
  const debouncedSave = useDebounce(commitPageText, 300);

  const [localText, setLocalText] = useState(page?.text ?? '');
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [caretPos, setCaretPos] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    activeTextareaRef.current = textareaRef.current;
  });

  const lastPageId = useRef(page?.id);
  // Tracks the text WE last pushed to the store, so we can tell the
  // difference between "the store caught up with what I typed" (ignore) and
  // "something else changed page.text" e.g. applying a template (pick it up).
  const lastPushedText = useRef(page?.text ?? '');
  // True from the moment a keystroke schedules a debounced write until that
  // write actually lands in the store (see commitPageText above). While
  // true, page.text is *expected* to lag behind localText - that's the
  // debounce working as designed, not an external change to adopt. Without
  // this guard, the render-time sync-back below would revert every single
  // keystroke back to the stale store value before the 300ms timer even had
  // a chance to fire, because it had no way to distinguish "still pending"
  // from "something else changed the page".
  const pendingWriteRef = useRef(false);

  // Lets the backup schedule (authSlice) force-commit whatever's still
  // sitting in the debounce window right before it snapshots, so a backup
  // is never stale by even the ~300ms debounce margin.
  const localTextRef = useRef(localText);
  useEffect(() => { localTextRef.current = localText; }, [localText]);
  useEffect(() => {
    const flush = () => {
      lastPushedText.current = localTextRef.current;
      pendingWriteRef.current = false;
      updatePageText(localTextRef.current);
    };
    window.addEventListener('manus:flush-pending-save', flush);
    return () => window.removeEventListener('manus:flush-pending-save', flush);
  }, [updatePageText]);

  if (page?.id !== lastPageId.current) {
    lastPageId.current = page?.id;
    lastPushedText.current = page?.text ?? '';
    pendingWriteRef.current = false;
    setLocalText(page?.text ?? '');
    setTagSuggestions([]);
  } else if (
    !pendingWriteRef.current &&
    page?.text !== undefined &&
    page.text !== lastPushedText.current &&
    page.text !== localText
  ) {
    lastPushedText.current = page.text;
    setLocalText(page.text);
  }

  const handleChange = useCallback((e) => {
    let val = e.target.value;
    if (settings.smartQuotesEnabled) {
      val = applySmartQuotes(localText, val);
    }
    setLocalText(val);
    lastPushedText.current = val;
    pendingWriteRef.current = true;
    debouncedSave(val);

    const cursor = e.target.selectionStart;
    const before = val.slice(0, cursor);
    const tagMatch = before.match(/<(\w*)$/);
    if (tagMatch) {
      setTagSuggestions(getTagSuggestions(tagMatch[1]));
      setCaretPos(getCaretCoordinates(e.target, cursor));
    } else {
      setTagSuggestions([]);
    }
  }, [localText, settings.smartQuotesEnabled, debouncedSave]);

  const insertTag = useCallback((tag) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const cursor = ta.selectionStart;
    const before = localText.slice(0, cursor);
    const after = localText.slice(cursor);
    const newBefore = before.replace(/<\w*$/, `<${tag}>`);
    const newVal = newBefore + `</${tag}>` + after;
    setLocalText(newVal);
    lastPushedText.current = newVal;
    pendingWriteRef.current = true;
    debouncedSave(newVal);
    setTagSuggestions([]);
    setTimeout(() => {
      const cursorPos = newBefore.length;
      ta.selectionStart = ta.selectionEnd = cursorPos;
      ta.focus();
    }, 0);
  }, [localText, debouncedSave]);

  // Only committed (final) speech segments arrive here - see
  // useSpeechToText - so this is just "insert text at the cursor",
  // the same pattern as insertTag above.
  const handleVoiceResult = useCallback((transcript) => {
    const ta = textareaRef.current;
    const cursor = ta ? ta.selectionStart : localText.length;
    const before = localText.slice(0, cursor);
    const after = localText.slice(cursor);
    const needsLeadingSpace = before.length > 0 && !/\s$/.test(before);
    const insertion = (needsLeadingSpace ? ' ' : '') + transcript + ' ';
    const newVal = before + insertion + after;
    setLocalText(newVal);
    lastPushedText.current = newVal;
    pendingWriteRef.current = true;
    debouncedSave(newVal);
    setTimeout(() => {
      if (!ta) return;
      const pos = before.length + insertion.length;
      ta.selectionStart = ta.selectionEnd = pos;
      ta.focus();
    }, 0);
  }, [localText, debouncedSave]);

  const speech = useSpeechToText(handleVoiceResult);

  return { localText, handleChange, textareaRef, tagSuggestions, caretPos, insertTag, speech };
}
