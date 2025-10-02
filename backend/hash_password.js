const bcrypt = require('bcryptjs');

async function hashPassword() {
  const password = '7JppT8xv1xGVG8fR';
  const hash = await bcrypt.hash(password, 10);
  console.log('Password hash:', hash);
  
  // Test if it matches
  const isValid = await bcrypt.compare(password, hash);
  console.log('Hash validates:', isValid);
}

hashPassword().catch(console.error);
