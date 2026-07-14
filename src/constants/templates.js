export const TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank',
    description: 'Empty page, default settings',
    text: '',
    settings: null,
  },
  {
    id: 'answer-sheet',
    name: 'Answer Sheet',
    description: 'Numbered answers, ruled paper',
    text: '1. \n\n2. \n\n3. \n\n4. \n\n5. ',
    settings: {
      paperType: 'lined',
      fontSize: 20,
    },
  },
  {
    id: 'letter',
    name: 'Letter Format',
    description: 'Formal letter layout',
    text: '[City, Date]\n\nSubject: \n\nRespected Sir/Madam,\n\n\n\n\n\nYours sincerely,\n[Name]',
    settings: {
      paperType: 'blank',
      paperMarginLeftEnabled: true,
      paperMarginLeft: 80,
      paperMarginRightEnabled: true,
      paperMarginRight: 60,
      fontSize: 20,
    },
  },
  {
    id: 'diary',
    name: 'Diary Entry',
    description: 'Personal journal format',
    text: 'Dear Diary,\n\n',
    settings: {
      paperType: 'lined',
      fontSize: 22,
    },
  },
  {
    id: 'study-notes',
    name: 'Study Notes',
    description: 'Cornell-style note layout',
    text: '<bl>Topic: </bl>\n\n<r>Key concept:</r>\n\n\n\n<r>Summary:</r>\n\n',
    settings: {
      paperType: 'cornell',
      fontSize: 18,
    },
  },
];
