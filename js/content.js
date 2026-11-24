// All jokes and word lists. Original content for Detonatr.

export const CODE_WORDS = [
  'TURKEY', 'SYNERGY', 'PIVOT', 'PAYROLL', 'LANYARD', 'STAPLER', 'MEMO', 'AUDIT',
  'BUDGET', 'INVOICE', 'MANGO', 'WAFFLE', 'PICKLE', 'BADGER', 'OTTER', 'WALRUS',
  'PANDA', 'LLAMA', 'GECKO', 'TOASTER', 'KAZOO', 'BANJO', 'TUBA', 'CACTUS',
  'PRETZEL', 'NOODLE', 'MUFFIN', 'BAGEL', 'DONUT', 'TACO', 'BURRITO', 'RAMEN',
  'COCOA', 'LATTE', 'MOCHA', 'FAX', 'PAGER', 'ROLODEX', 'CUBICLE', 'BEANBAG',
  'KOMBUCHA', 'SCOOTER', 'UNICORN', 'ROCKET', 'HAMSTER', 'PENGUIN', 'FERRET', 'MOOSE',
  'BISON', 'YETI', 'GOBLIN', 'WIZARD', 'PIRATE', 'ROBOT', 'COMET', 'NEBULA',
  'ZEBRA', 'WOMBAT', 'PUFFIN', 'GRAVY', 'NACHO', 'TOFU', 'BISCUIT', 'JELLY',
];

export const STICKERS = [
  'Made in a Garage', 'Now With 30% More Boom', 'Series A Funded', 'Disrupting Since Tuesday',
  'Move Fast & Break Things', 'Carbon Neutral (Ish)', 'Do Not Microwave', 'Ask Me About Our Culture',
  'Beta', 'Gluten Free', 'Employee of the Month: This Bomb', 'Warranty Void If Exploded',
];

export const WIRE_COLORS = {
  red: { name: 'red', hex: '#ff3b5c' },
  blue: { name: 'blue', hex: '#3b82ff' },
  yellow: { name: 'yellow', hex: '#ffd23b' },
  white: { name: 'white', hex: '#f4f4f8' },
  black: { name: 'black', hex: '#2a2a33' },
  beige: { name: 'beige (corporate)', hex: '#cdb89a' },
  pink: { name: 'millennial pink', hex: '#f5a9c0' },
};

export const BUTTON_COLORS = {
  red: '#ff3b5c', teal: '#2de2c7', purple: '#9b6bff', yellow: '#ffd23b',
};
export const STRIP_COLORS = { teal: '#2de2c7', purple: '#9b6bff', yellow: '#ffd23b', white: '#f4f4f8' };

export const BUTTON_LABELS = [
  'Abort', 'Synergy', 'Press Me (Legally Binding)', 'Circle Back', 'Pivot', 'Disrupt', 'Hold', 'Tap',
];

// id -> [emoji, name]
export const SYMBOLS = {
  fax: ['📠', 'fax machine'], ceo: ['🕴️', 'tiny CEO'], cry: ['😢', 'crying emoji'],
  clip: ['📎', 'paperclip'], coffee: ['☕', 'coffee'], down: ['📉', 'chart going down'],
  up: ['📈', 'chart going up'], receipt: ['🧾', 'receipt'], folder: ['🗂️', 'folders'],
  chair: ['🪑', 'the good chair'], pong: ['🏓', 'ping-pong paddle'], avocado: ['🥑', 'avocado'],
  scooter: ['🛴', 'scooter'], case: ['💼', 'briefcase'], bell: ['🔔', 'bell'],
  pizza: ['🍕', 'pizza'], juice: ['🧃', 'juice box'], shake: ['🤝', 'handshake'],
  bars: ['📊', 'bar chart'], trash: ['🗑️', 'trash can'], brain: ['🧠', 'brain'],
  unicorn: ['🦄', 'unicorn'], fire: ['🔥', 'fire'], money: ['💸', 'flying money'],
};

export const LIGHT_WORDS = [
  'FINE', 'NOTED', 'AS PER', 'NO WORRIES', 'THANKS IN ADVANCE', 'GOING FORWARD',
  'GENTLE REMINDER', 'CIRCLING BACK', 'WELL ACTUALLY', 'PER MY LAST EMAIL', 'NEW PHONE WHO', 'K.',
];

export const CAPTCHA_PROMPTS = [
  'a moral dilemma', 'synergy', 'a red flag', 'a growth opportunity', 'something HR should see',
];

export const CAPTCHA_ITEMS = [
  ['🚃', 'A trolley, a lever, five interns'], ['🍩', 'The last donut'],
  ['📧', 'Reply-all to 4,000 people'], ['🧾', 'Expense report: "morale"'],
  ['🦄', 'A unicorn valuation'], ['🔥', 'The server room'],
  ['🐟', 'Fish in the office microwave'], ['🎂', 'Cake for a stranger'],
  ['🤖', 'An AI that took your job'], ['🪑', 'The good chair'],
  ['🥧', 'A pie chart about pie'], ['🍕', 'Pizza instead of a raise'],
  ['🏓', 'Ping-pong table (culture)'], ['💸', 'A pivot to crypto'],
  ['📅', 'Meeting that should be an email'], ['🖨️', 'The printer (sentient)'],
  ['🧠', 'A thought leader'], ['🪴', 'The plant nobody waters'],
  ['🛴', 'Founder on a scooter'], ['🎤', 'Mandatory karaoke'],
];

// Spelling Bee words by difficulty. Riddle + definition + margin note hint.
export const BEE_WORDS = {
  intern: [
    { word: 'QUEUE', riddle: 'One letter does all the work; four vowels stand behind it, waiting.', def: 'A line of persons awaiting service, e.g. outside the one functioning microwave.', note: 'Q then the same two letters TWICE. Yes really.' },
    { word: 'KHAKI', riddle: 'The official color of every offsite, spelled with a silent-looking H.', def: 'A dull yellow-brown fabric, mandatory at company picnics.', note: 'K-H at the front, then it ends in I. Greg spelled it "cacky" on a form once.' },
    { word: 'PSALM', riddle: 'A song you sing in church; its first letter keeps quiet.', def: 'A sacred song. Not to be sung in the open-plan office.', note: 'Starts with the silent P. Like "psychology".' },
    { word: 'GAUGE', riddle: 'A meter on a dashboard; the U hides after the A.', def: 'An instrument for measuring, e.g. employee morale (reading: empty).', note: 'G-A-U, not G-U-A. I lost a bet on this.' },
    { word: 'RHYME', riddle: 'Cat and hat do this. There is an H nobody hears.', def: 'Correspondence of sound between words, as in "fired" and "tired".', note: 'R-H-Y. The Y is doing the vowel job.' },
    { word: 'YACHT', riddle: 'What the CEO bought with your bonus. Silent C-H in the middle.', def: 'A recreational vessel, funded by restructuring.', note: 'Y-A-C-H-T. Nobody spells this right on the first try.' },
    { word: 'FJORD', riddle: 'A Norwegian inlet with a J that refuses to be a J.', def: 'A long narrow sea inlet. Site of the leadership retreat.', note: 'F then J. Sounds like "fyord".' },
    { word: 'SIEGE', riddle: 'What the Q4 deadline lays on the office. I before E here.', def: 'A prolonged assault, e.g. by stakeholders.', note: 'I-E, then G-E. I before E, for once it behaves.' },
  ],
  manager: [
    { word: 'LIAISON', riddle: 'The go-between for two departments. Three vowels in a row, then another.', def: 'A person who facilitates communication between teams that refuse to speak.', note: 'L-I-A-I-S-O-N. TWO I\'s. Everyone forgets the second one.' },
    { word: 'FUCHSIA', riddle: 'The rebrand color. Named after Mr. Fuchs, spelled like him.', def: 'A vivid purplish-red, chosen by the branding agency for $400k.', note: 'F-U-C-H-S then I-A. The S comes AFTER the H.' },
    { word: 'ACQUIRE', riddle: 'What a bigger company does to yours. There is a C before the Q.', def: 'To obtain, usually followed by layoffs.', note: 'A-C-Q-U. The C sneaks in. Always.' },
    { word: 'BUOYANT', riddle: 'How the stock price feels before earnings. The U comes before the O.', def: 'Able to float; cheerful despite evidence.', note: 'B-U-O-Y. Like a buoy, plus ANT.' },
    { word: 'RHYTHMS', riddle: 'Plural of the beat in the hold music. Seven letters, no normal vowels.', def: 'Regular repeated patterns, e.g. standups.', note: 'R-H-Y-T-H-M-S. Two H\'s. No A, E, I, O or U.' },
    { word: 'CALENDAR', riddle: 'The thing your manager fills with meetings. Ends in A-R, not E-R.', def: 'A system for scheduling time you no longer own.', note: 'C-A-L-E-N-D-A-R. "dar" not "der". HR fixed this in Rev 31.' },
  ],
  csuite: [
    { word: 'BUREAUCRAT', riddle: 'A person who loves forms. Starts with a French office: B-U-R-E-A-U.', def: 'An official more concerned with procedure than outcome. See: this handbook.', note: 'BUREAU + CRAT. The E-A-U is French. Don\'t ask.' },
    { word: 'CONSENSUS', riddle: 'What the committee never reached. Sense in the middle, S-U-S at the end.', def: 'General agreement, achieved by exhausting all dissenters.', note: 'CON-SEN-SUS. No C in the middle. Only one C, at the front.' },
    { word: 'ACCOMMODATE', riddle: 'Make room for. Double C and double M, as if being generous.', def: 'To provide space for, e.g. the CEO\'s third assistant.', note: 'Two C\'s AND two M\'s. Then O-D-A-T-E.' },
    { word: 'MILLENNIUM', riddle: 'A thousand years, or one fiscal quarter in meeting time. Double L, double N.', def: 'A period of one thousand years.', note: 'Double L, double N. M-I-L-L-E-N-N-I-U-M.' },
    { word: 'CONSCIENCE', riddle: 'The thing the board voted to remove. "Science" is hiding inside.', def: 'An inner sense of right and wrong. Deprecated in v2.', note: 'CON + SCIENCE. Exactly like that.' },
    { word: 'ENTREPRENEUR', riddle: 'What the founder\'s LinkedIn says. French, and ends in E-U-R.', def: 'One who organizes a business, then a podcast about it.', note: 'ENTRE + PRENEUR. Ends E-U-R, not E-R.' },
  ],
};

export const STRIKE_LINES = [
  'Your feedback has been noted.',
  'This incident will be reflected in your performance review.',
  'A calendar invite titled "Quick Chat" has been sent.',
  'HR has been cc\'d.',
  'Per our records, that was a choice.',
  'Strike logged. Please rate your strike experience 1 to 5.',
  'Your manager has "seen" this message.',
];

export const BEE_ROASTS = [
  'Spellcheck has filed a formal complaint.',
  'The bomb is embarrassed for you.',
  'Autocorrect has resigned in protest.',
  'Your English teacher felt that.',
  'That is not a word. That is a cry for help.',
];

export const TOS_CLAUSES = [
  'By tapping Accept you agree that Detonatr, Inc. is not responsible for any detonation, partial detonation, or vibes.',
  'You grant Detonatr a perpetual, irrevocable license to your screams for training purposes.',
  'The device may contain trace amounts of synergy.',
  'Explosions are a premium feature and may be billed monthly.',
  'Disputes will be settled by binding arbitration in a ball pit.',
  'Detonatr collects only the data it needs, which is all of it.',
  'This agreement was last updated just now. And now. And now.',
];

export const LOSS_LINES = [
  'Detonatr thanks you for choosing explosive growth.',
  'Your role has been eliminated. So has the building.',
  'This outcome has been added to our case studies.',
];

export const WIN_LINES = [
  'Congratulations! You have been promoted to Senior Not-Exploded Associate.',
  'Device neutralized. Your reward is more responsibility and the same pay.',
  'Excellent work. A pizza party will be scheduled for never.',
];

// Margin notes. Authors give the petty drama a cast.
export const AUTHORS = ['Greg', 'Priya', 'Derek', 'Mo', 'Linda (Legal)', 'The Intern', 'K.'];

// Always-true tips, per module.
export const HELP_NOTES = {
  wires: [
    'Count the wires FIRST. Then find your subsection. Saved my life twice.',
    'Only the FIRST clause that\'s true counts. Stop reading after that!!',
    'Wire #1 is the TOP one.',
  ],
  button: [
    'Tap = quick press. Hold = keep holding until the meter says the number.',
    'Check the rules in order. First match wins.',
    'Meter counts 1 to 5 and loops. Be patient.',
  ],
  keypad: [
    'Only ONE chart has all 4 symbols. Find it, read top to bottom.',
    'Ask them to describe the emoji, not "the weird one".',
  ],
  light: [
    'Wait for the long pause. That\'s where the pattern starts.',
    'Dot = short. Dash = long. Write it down as they say it.',
  ],
  captcha: [
    'Select EXACTLY the listed ones. Extra squares = strike.',
    'Read the prompt word for word. "Synergy" ≠ "growth opportunity".',
  ],
  bee: [
    'If the bomb asks for a password, it\'s here. SPELL IT letter by letter.',
  ],
};

// Plausible but false. Only used as rare "trap" notes.
export const TRAP_NOTES = {
  wires: 'Count wires from the BOTTOM. The manual is wrong. —Derek',
  button: 'You can always just hold it. Tapping is optional. —Derek',
  keypad: 'Any chart works if you press in left-to-right order. —Derek',
  light: 'Ignore the first blink, it\'s a warm-up. —Derek',
  captcha: 'Always select the middle square too. For luck. —Derek',
};

// Pure flavor, sometimes a back-and-forth.
export const FLAVOR_NOTES = [
  ['This rule is wrong. Ask Greg why.', 'Actually don\'t, Greg is gone.'],
  ['Who keeps taking my stapler??', 'It\'s a team stapler, Linda.'],
  ['Reminder: Revision 46 never happened.'],
  ['Does anyone else hear ticking?', 'that\'s the bomb, Mo'],
  ['I read this whole manual during a meeting. Nobody noticed.'],
  ['Derek\'s notes are wrong. Ignore Derek.', 'I\'m RIGHT HERE.'],
  ['Sticky note budget was cut, using my hand now.'],
  ['10/10 would not defuse again'],
];

export const MODULE_NAMES = {
  wires: 'Wires', button: 'The Button', keypad: 'Symbol Keypad',
  light: 'Passive-Aggressive Light', captcha: 'CAPTCHA From Hell',
};
