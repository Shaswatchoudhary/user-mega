const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/screens/services');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Insert firestore import if not exists
  if (!content.includes("@react-native-firebase/firestore")) {
    content = content.replace("import { API_BASE_URL } from '../../constants/config';", "import { API_BASE_URL } from '../../constants/config';\nimport firestore from '@react-native-firebase/firestore';");
  }

  // Find the exact name of the setter inside the original fetch method
  // It usually looks like setWorkers(mappedWorkers); or setElectricians(mappedWorkers);
  let setterName = 'setWorkers';
  const setterMatch = content.match(/set([A-Za-z]+)\(mappedWorkers\)/);
  if (setterMatch) {
    setterName = 'set' + setterMatch[1];
  }

  // Define our new fetch method
  const newFetchMethod = `const fetchFunction = async () => {
    try {
      setLoading(true);
      const snapshot = await firestore()
        .collection('workers')
        .where('category', '==', category)
        .where('isVerified', '==', true)
        .where('isActive', '==', true)
        .where('isAvailable', '==', true)
        .get();

      const mappedWorkers = snapshot.docs.map(doc => {
        const worker = doc.data();
        return {
          id: doc.id,
          name: worker.fullName || "Service Professional",
          rating: worker.rating || 4.5,
          reviewCount: worker.completedOrders || 0,
          experience: \`\${worker.experience || 0}+ Years\`,
          rate: worker.basePrice || worker.rate || 299,
          distance: 0,
          verified: worker.isVerified !== false,
          specialization: worker.category || category,
          ...worker
        };
      });
      ${setterName}(mappedWorkers);
    } catch (error) {
      console.error('FULL ERROR DETAILS:', error);
    } finally {
      setLoading(false);
    }
  };`.replace('fetchFunction', content.includes('fetchElectricians') ? 'fetchElectricians' : 'fetchWorkers');

  // Regex to replace the old fetch logic
  const fetchRegex = /const (fetchWorkers|fetchElectricians) = async \(\) => \{[\s\S]*?finally \{\s*setLoading\(false\);\s*\}\s*\};/;
  
  if (fetchRegex.test(content)) {
    content = content.replace(fetchRegex, newFetchMethod);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Refactored ${file}`);
  } else {
    console.log(`⚠️ Could not match fetch method in ${file}`);
  }
});
