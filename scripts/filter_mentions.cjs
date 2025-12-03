const fs = require('fs');

const data = JSON.parse(fs.readFileSync('/tmp/all_mentions.json', 'utf8'));
const aiRegex = /\b(AI|A\.I\.|Artificial Intelligence)\b/i;

const keep = [];
const filterOut = [];

data.forEach(m => {
  if (aiRegex.test(m.contextText)) {
    keep.push(m.contributionExtId);
  } else {
    filterOut.push(m.contributionExtId);
  }
});

console.log('=== FILTER ANALYSIS ===');
console.log('Total:', data.length);
console.log('Keep:', keep.length);
console.log('Filter out:', filterOut.length);
console.log('Keep percentage:', ((keep.length / data.length) * 100).toFixed(1) + '%');

// Save IDs to delete
fs.writeFileSync('/tmp/mentions_to_delete.json', JSON.stringify(filterOut, null, 2));
fs.writeFileSync('/tmp/mentions_to_keep.json', JSON.stringify(keep, null, 2));

console.log('\nSaved IDs to /tmp/mentions_to_delete.json and /tmp/mentions_to_keep.json');
