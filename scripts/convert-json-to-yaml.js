const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Get all JSON files in the data directory
const jsonFiles = fs.readdirSync(DATA_DIR)
  .filter(file => file.endsWith('.json'));

console.log('Files to convert:');
console.log(jsonFiles);

// Convert each JSON file to YAML
jsonFiles.forEach(jsonFile => {
  const jsonPath = path.join(DATA_DIR, jsonFile);
  const yamlPath = path.join(DATA_DIR, jsonFile.replace('.json', '.yml'));
  
  try {
    // Skip if YAML file already exists and has same modification time
    if (fs.existsSync(yamlPath)) {
      const jsonStat = fs.statSync(jsonPath);
      const yamlStat = fs.statSync(yamlPath);
      
      if (yamlStat.mtime > jsonStat.mtime) {
        console.log(`Skipping ${jsonFile} - YAML file is newer`);
        return;
      }
    }
    
    // Read JSON file
    const jsonContent = fs.readFileSync(jsonPath, 'utf8');
    const data = JSON.parse(jsonContent);
    
    // Convert to YAML
    const yamlContent = yaml.dump(data, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false
    });
    
    // Write YAML file
    fs.writeFileSync(yamlPath, yamlContent, 'utf8');
    
    console.log(`Converted ${jsonFile} to ${jsonFile.replace('.json', '.yml')}`);
  } catch (error) {
    console.error(`Error converting ${jsonFile}:`, error);
  }
}); 