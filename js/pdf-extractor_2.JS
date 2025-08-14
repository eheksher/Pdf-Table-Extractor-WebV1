// pdf-extractor_2.js - גרסה פשוטה: שליפת טקסט + כפילות + חיפוש + סימון + סינון

console.log('🔧 טוען תוספת פשוטה...');

// *** משתנים גלובליים פשוטים ***
var extractedTexts = []; // כל הטקסטים שנמצאו
var isExtracting = false;
var searchResults = []; // תוצאות חיפוש
var duplicateResults = []; // תוצאות כפילות
var isSimpleSearchMode = false;
var isSimpleDuplicateMode = false;

// *** משתנים חדשים לסיווג ***
var classificationSettings = []; // הגדרות הסיווגים שהמשתמש הגדיר
var currentClassificationMode = null; // הסיווג הנוכחי שפועל
var isClassificationMode = false;

// *** המתנה לטעינת הקובץ הראשי ***
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    if (typeof window.files !== 'undefined') {
      initSimpleFeatures();
    } else {
      setTimeout(arguments.callee, 500);
    }
  }, 1000);
});

// *** הגדרת פונקציות גלובליות מיד ***
window.showClassificationPopup = showClassificationPopup;
window.closeClassificationPopup = closeClassificationPopup;
window.addClassification = addClassification;
window.deleteClassification = deleteClassification;
window.applyClassification = applyClassification;
window.addClassificationColumnManually = addClassificationColumnManually;
window.runAutoClassification = runAutoClassification;

// *** פונקציה ידנית להוספת עמודת סיווג ***
function addClassificationColumnManually() {
  console.log('🔧 מוסיף עמודת סיווג באופן ידני...');
  
  const classificationColumn = 'סיווג';
  
  // בדיקה אם המערכת מוכנה
  if (typeof window.customHeaders === 'undefined') {
    showSimpleToast('המערכת עדיין לא נטענה - נסה שוב בעוד רגע');
    return;
  }
  
  // בדיקה אם העמודה כבר קיימת
  if (window.customHeaders.indexOf(classificationColumn) !== -1) {
    showSimpleToast('עמודת סיווג כבר קיימת!');
    return;
  }
  
  // הוספת העמודה
  window.customHeaders.push(classificationColumn);
  
  if (typeof window.visibleHeaders !== 'undefined') {
    window.visibleHeaders.push(classificationColumn);
  }
  
  // הוספה לכל השורות הקיימות
  if (typeof window.data !== 'undefined' && window.data.length > 0) {
    window.data.forEach(function(row) {
      row[classificationColumn] = '';
    });
    console.log(`✅ עמודת סיווג נוספה ל-${window.data.length} שורות`);
  }
  
  // שמירה ועדכון
  if (typeof window.saveDataToStorage === 'function') {
    window.saveDataToStorage();
  }
  
  if (typeof window.renderTable === 'function') {
    window.renderTable();
  }
  
  showSimpleToast('עמודת סיווג נוספה בהצלחה!');
  console.log('✅ עמודת סיווג נוספה ידנית');
}

// *** פונקציה לסיווג אוטומטי של כל הקבצים ***
// תיקון פונקציית הסיווג האוטומטי עם דיבוג מפורט

function runAutoClassification() {
  console.log('מתחיל סיווג אוטומטי...');
  
  // *** בדיקות ראשוניות מפורטות ***
  
  // בדיקה 1: האם יש טקסטים שנשלפו
  if (!extractedTexts || extractedTexts.length === 0) {
    alert('❌ לא נמצאו טקסטים! אנא הרץ "שלוף טקסטים" תחילה');
    console.error('extractedTexts ריק או לא קיים:', extractedTexts);
    return;
  }
  console.log(`✅ נמצאו ${extractedTexts.length} טקסטים`);
  
  // בדיקה 2: האם יש סיווגים מוגדרים
  if (!classificationSettings || classificationSettings.length === 0) {
    alert('❌ לא הוגדרו סיווגים! אנא הגדר סיווגים ב"ניהול סיווגים" תחילה');
    console.error('classificationSettings ריק או לא קיים:', classificationSettings);
    return;
  }
  console.log(`✅ נמצאו ${classificationSettings.length} סיווגים:`, classificationSettings);
  
  // בדיקה 3: האם יש נתונים
  if (!window.data || window.data.length === 0) {
    alert('❌ לא נמצאו קבצים! אנא טען קבצי PDF תחילה');
    console.error('window.data ריק או לא קיים:', window.data);
    return;
  }
  console.log(`✅ נמצאו ${window.data.length} קבצים במערכת`);
  
  // בדיקה 4: וידוא שעמודת הסיווג קיימת
  const hasClassificationColumn = window.data[0] && window.data[0].hasOwnProperty('סיווג');
  if (!hasClassificationColumn) {
    console.log('⚠️ עמודת סיווג לא קיימת - מוסיף אותה...');
    addClassificationColumnManually();
    
    // בדיקה אם ההוספה הצליחה
    if (!window.data[0] || !window.data[0].hasOwnProperty('סיווג')) {
      alert('❌ שגיאה ביצירת עמודת הסיווג!');
      return;
    }
  }
  console.log('✅ עמודת סיווג קיימת');
  
  // *** התחלת תהליך הסיווג ***
  
  let classifiedCount = 0;
  let debugResults = [];
  
  // עבור על כל קובץ
  window.data.forEach(function(fileData, fileIndex) {
    const fileName = fileData['שם קובץ'] || fileData['fileName'] || `קובץ ${fileIndex + 1}`;
    
    console.log(`\n🔍 מעבד קובץ ${fileIndex + 1}: ${fileName}`);
    
    // קבל את כל הטקסטים של הקובץ הזה
    const fileTexts = extractedTexts.filter(t => t.fileIndex === fileIndex);
    
    if (fileTexts.length === 0) {
      console.log(`⚠️ לא נמצאו טקסטים עבור קובץ ${fileName}`);
      debugResults.push({
        fileName: fileName,
        status: 'אין טקסטים',
        classification: ''
      });
      return;
    }
    
    // צרף את כל הטקסטים לטקסט אחד
    const allText = fileTexts.map(t => t.text).join(' ').toLowerCase();
    console.log(`📝 טקסט מהקובץ (100 תווים ראשונים): "${allText.substring(0, 100)}..."`);
    
    // חפש את הסיווג הטוב ביותר
    let bestClassification = '';
    let maxMatches = 0;
    let detailedMatches = [];
    
    classificationSettings.forEach(function(classification) {
      let matches = 0;
      let foundTerms = [];
      
      classification.terms.forEach(function(term) {
        // ספור כמה פעמים המילה מופיעה
        const regex = new RegExp(term.toLowerCase(), 'g');
        const termMatches = (allText.match(regex) || []).length;
        
        if (termMatches > 0) {
          matches += termMatches;
          foundTerms.push(`${term}(${termMatches})`);
        }
      });
      
      detailedMatches.push({
        classification: classification.name,
        matches: matches,
        foundTerms: foundTerms
      });
      
      console.log(`   🏷️ סיווג "${classification.name}": ${matches} התאמות [${foundTerms.join(', ')}]`);
      
      // אם יש יותר התאמות מהסיווג הנוכחי
      if (matches > maxMatches && matches > 0) {
        maxMatches = matches;
        bestClassification = classification.name;
      }
    });
    
    // עדכן את הסיווג בטבלה
    if (bestClassification) {
      fileData['סיווג'] = bestClassification;
      classifiedCount++;
      console.log(`✅ קובץ "${fileName}" סווג כ: "${bestClassification}" עם ${maxMatches} התאמות`);
      
      debugResults.push({
        fileName: fileName,
        status: 'סווג בהצלחה',
        classification: bestClassification,
        matches: maxMatches,
        details: detailedMatches
      });
    } else {
      console.log(`❌ לא נמצא סיווג מתאים עבור "${fileName}"`);
      fileData['סיווג'] = ''; // השאר ריק
      
      debugResults.push({
        fileName: fileName,
        status: 'לא נמצא סיווג',
        classification: '',
        details: detailedMatches
      });
    }
  });
  
  // *** סיום התהליך ***
  
  console.log('\n📊 סיכום תהליך הסיווג:');
  console.log('תוצאות מפורטות:', debugResults);
  
  // שמור את השינויים
  if (typeof window.saveDataToStorage === 'function') {
    console.log('💾 שומר נתונים...');
    window.saveDataToStorage();
  }
  
  // עדכן את הטבלה
  if (typeof window.renderTable === 'function') {
    console.log('🔄 מעדכן טבלה...');
    window.renderTable();
  }
  
  // הודעת סיכום
  const message = `🎯 סיווג אוטומטי הושלם!\n✅ ${classifiedCount} קבצים סווגו בהצלחה\n📁 מתוך ${window.data.length} קבצים כולל`;
  alert(message);
  
  console.log(`🎯 סיום: ${classifiedCount}/${window.data.length} קבצים סווגו`);
  
  // החזר תוצאות לדיבוג
  return {
    total: window.data.length,
    classified: classifiedCount,
    details: debugResults
  };
}

// *** פונקציית עזר משופרת להוספת עמודת סיווג ***
function addClassificationColumnManually() {
  console.log('🔧 מוסיף עמודת סיווג באופן ידני...');
  
  const classificationColumn = 'סיווג';
  
  // בדיקות בטיחות
  if (typeof window.data === 'undefined' || !window.data) {
    console.error('❌ window.data לא קיים');
    alert('❌ שגיאה: לא נמצאו נתונים במערכת');
    return false;
  }
  
  if (window.data.length === 0) {
    console.error('❌ window.data ריק');
    alert('❌ שגיאה: אין קבצים במערכת');
    return false;
  }
  
  // בדיקה אם העמודה כבר קיימת
  if (window.data[0] && window.data[0].hasOwnProperty(classificationColumn)) {
    console.log('✅ עמודת סיווג כבר קיימת');
    return true;
  }
  
  // הוספת עמודה לכל השורות
  window.data.forEach(function(row) {
    row[classificationColumn] = '';
  });
  
  // עדכון רשימת העמודות אם קיימת
  if (typeof window.customHeaders !== 'undefined' && Array.isArray(window.customHeaders)) {
    if (window.customHeaders.indexOf(classificationColumn) === -1) {
      window.customHeaders.push(classificationColumn);
      console.log('✅ עמודה נוספה ל-customHeaders');
    }
  }
  
  if (typeof window.visibleHeaders !== 'undefined' && Array.isArray(window.visibleHeaders)) {
    if (window.visibleHeaders.indexOf(classificationColumn) === -1) {
      window.visibleHeaders.push(classificationColumn);
      console.log('✅ עמודה נוספה ל-visibleHeaders');
    }
  }
  
  console.log(`✅ עמודת "${classificationColumn}" נוספה ל-${window.data.length} שורות`);
  
  // שמירה ועדכון
  if (typeof window.saveDataToStorage === 'function') {
    window.saveDataToStorage();
  }
  
  if (typeof window.renderTable === 'function') {
    window.renderTable();
  }
  
  return true;
}

// עדכון הפונקציות הגלובליות
window.runAutoClassification = runAutoClassification;
window.addClassificationColumnManually = addClassificationColumnManually;

console.log('🔧 פונקציות סיווג אוטומטי עודכנו עם דיבוג מפורט');
function initSimpleFeatures() {
  addSimpleButtons();
  console.log('✅ תוספת פשוטה פעילה');
}

// *** הוספת כפתורים פשוטים - רק אם לא קיימים ***
function addSimpleButtons() {
  const analysisTab = document.getElementById('analysis-tab');
  if (!analysisTab) return;
  
  // בדיקה אם הכפתורים כבר קיימים ב-HTML
  if (document.getElementById('simpleDuplicateBtn')) {
    console.log('✅ כפתורים כבר קיימים ב-HTML - לא מוסיף כפילויות');
    
    // אבל עדיין צריך להוסיף את הסטיילים
    addSimpleStyles();
    return; // אל תוסיף כפתורים אם הם כבר קיימים
  }
  
  console.log('⚠️ כפתורים לא נמצאו ב-HTML - מוסיף דינמית');
  
  // כפתור שליפת טקסטים
  const extractGroup = document.createElement('div');
  extractGroup.className = 'button-group';
  extractGroup.innerHTML = `
    <button class="office-btn simple-feature" onclick="extractAllTexts()" 
            title="שלוף את כל הטקסטים מהקבצים עם מיקום">
      <div class="btn-text">📄<br>שלוף טקסטים</div>
    </button>
  `;
  
  // כפתור כפילות פשוט
  const duplicateGroup = document.createElement('div');
  duplicateGroup.className = 'button-group';
  duplicateGroup.innerHTML = `
    <button class="office-btn simple-feature" onclick="findTextDuplicates()" id="simpleDuplicateBtn"
            title="מצא קבצים עם טקסטים זהים וסמן אותם">
      <div class="btn-text">👥<br>כפילות טקסט</div>
    </button>
  `;
  
  // כפתור חיפוש פשוט
  const searchGroup = document.createElement('div');
  searchGroup.className = 'button-group';
  searchGroup.innerHTML = `
    <input type="text" id="simpleSearchInput" placeholder="חפש טקסט..." 
           style="width: 120px; margin-bottom: 5px; padding: 4px; border: 1px solid #ccc; border-radius: 3px;"
           onkeypress="if(event.key==='Enter') searchTexts()">
    <button class="office-btn simple-feature" onclick="searchTexts()" id="simpleSearchBtn"
            title="חפש טקסט בכל הקבצים וסמן תוצאות">
      <div class="btn-text">🔍<br>חפש טקסט</div>
    </button>
  `;
  
  // כפתור ניהול סיווגים
  const classificationGroup = document.createElement('div');
  classificationGroup.className = 'button-group';
  classificationGroup.innerHTML = `
    <button class="office-btn classification-feature" onclick="showClassificationPopup()" 
            title="הגדר סיווגים מותאמים אישית לחיפושים">
      <div class="btn-text">🏷️<br>ניהול סיווגים</div>
    </button>
  `;
  
  // כפתור הוספת עמודת סיווג
  const addColumnGroup = document.createElement('div');
  addColumnGroup.className = 'button-group';
  addColumnGroup.innerHTML = `
    <button class="office-btn" onclick="addClassificationColumnManually()" 
            style="background: linear-gradient(135deg, #17a2b8, #138496) !important; color: white !important;"
            title="הוסף עמודת סיווג לטבלה אם היא לא קיימת">
      <div class="btn-text">➕<br>הוסף עמודת סיווג</div>
    </button>
  `;
  
  // כפתור סיווג אוטומטי
  const autoClassifyGroup = document.createElement('div');
  autoClassifyGroup.className = 'button-group';
  autoClassifyGroup.innerHTML = `
    <button class="office-btn" onclick="runAutoClassification()" 
            style="background: linear-gradient(135deg, #28a745, #20c997) !important; color: white !important;"
            title="סווג אוטומטית את כל הקבצים לפי הסיווגים שהוגדרו">
      <div class="btn-text">🤖<br>סיווג אוטומטי</div>
    </button>
  `;
  
  // כפתור ניקוי סינונים
  const clearGroup = document.createElement('div');
  clearGroup.className = 'button-group';
  clearGroup.innerHTML = `
    <button class="office-btn simple-clear" onclick="clearSimpleFilters()" 
            title="נקה את כל הסינונים וחזור לתצוגה רגילה">
      <div class="btn-text">🗑️<br>נקה סינונים</div>
    </button>
  `;
  
  // מונה תוצאות
  const counterGroup = document.createElement('div');
  counterGroup.className = 'button-group';
  counterGroup.innerHTML = `
    <div class="simple-counter" title="מספר קבצים שנמצאו בסינון הנוכחי">
      <div class="counter-label">תוצאות</div>
      <div class="counter-value" id="simpleResultsCount">0</div>
    </div>
  `;
  
  analysisTab.appendChild(extractGroup);
  analysisTab.appendChild(duplicateGroup);  
  analysisTab.appendChild(searchGroup);
  analysisTab.appendChild(classificationGroup);
  analysisTab.appendChild(addColumnGroup);
  analysisTab.appendChild(autoClassifyGroup);
  analysisTab.appendChild(clearGroup);
  analysisTab.appendChild(counterGroup);
  
  // סטיילים פשוטים
  addSimpleStyles();
}

// *** שליפת כל הטקסטים ***
function extractAllTexts() {
  if (isExtracting) {
    showSimpleToast('שליפה כבר פועלת...');
    return;
  }
  
  if (!window.files || window.files.length === 0) {
    showSimpleToast('אנא טען קבצי PDF תחילה');
    return;
  }
  
  isExtracting = true;
  extractedTexts = [];
  
  showSimpleToast('מתחיל לשלוף טקסטים...');
  
  extractFromAllFiles()
    .then(function(totalTexts) {
      isExtracting = false;
      showSimpleToast(`שליפה הושלמה! נמצאו ${totalTexts} טקסטים`);
      console.log('📄 כל הטקסטים:', extractedTexts);
    })
    .catch(function(error) {
      isExtracting = false;
      console.error('שגיאה בשליפה:', error);
      showSimpleToast('שגיאה בשליפת הטקסטים');
    });
}

// *** שליפה מכל הקבצים ***
function extractFromAllFiles() {
  const promises = [];
  
  for (let i = 0; i < window.files.length; i++) {
    promises.push(extractFromFile(window.files[i], i));
  }
  
  return Promise.all(promises)
    .then(function(results) {
      let total = 0;
      results.forEach(function(fileTexts) {
        extractedTexts = extractedTexts.concat(fileTexts);
        total += fileTexts.length;
      });
      return total;
    });
}

// *** שליפה מקובץ יחיד ***
function extractFromFile(file, fileIndex) {
  return file.arrayBuffer()
    .then(function(buffer) {
      const loadingTask = pdfjsLib.getDocument({
        data: buffer,
        cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/cmaps/',
        cMapPacked: true
      });
      return loadingTask.promise;
    })
    .then(function(pdf) {
      return extractFromPdf(pdf, file.name, fileIndex);
    });
}

// *** שליפה מ-PDF ***
function extractFromPdf(pdf, fileName, fileIndex) {
  const pagePromises = [];
  
  // מוגבל ל-5 עמודים ראשונים לביצועים
  for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 5); pageNum++) {
    pagePromises.push(extractFromPage(pdf, pageNum, fileName, fileIndex));
  }
  
  return Promise.all(pagePromises)
    .then(function(allPages) {
      const allTexts = [];
      allPages.forEach(function(pageTexts) {
        allTexts.push(...pageTexts);
      });
      return allTexts;
    });
}

// *** שליפה מעמוד ***
function extractFromPage(pdf, pageNum, fileName, fileIndex) {
  return pdf.getPage(pageNum)
    .then(function(page) {
      return page.getTextContent();
    })
    .then(function(textContent) {
      const pageTexts = [];
      
      if (textContent.items) {
        textContent.items.forEach(function(item) {
          if (item.str && item.str.trim()) {
            pageTexts.push({
              fileName: fileName,
              fileIndex: fileIndex,
              page: pageNum,
              text: item.str.trim(),
              x: Math.round(item.transform[4]),
              y: Math.round(item.transform[5]),
              width: Math.round(item.width),
              height: Math.round(item.height)
            });
          }
        });
      }
      
      return pageTexts;
    });
}

// *** חיפוש כפילות טקסט מתקדם ***
function findTextDuplicates() {
  if (extractedTexts.length === 0) {
    showSimpleToast('הרץ שליפת טקסטים תחילה');
    return;
  }
  
  duplicateResults = [];
  isSimpleDuplicateMode = true;
  isSimpleSearchMode = false;
  
  // תמיד השוואה על בסיס הטקסט שנשלף מה-PDF
  findDuplicatesByExtractedText();
  
  // עדכון בחירה וטבלה
  updateSimpleSelection(duplicateResults);
  setActiveSimpleButton('simpleDuplicateBtn');
  
  if (duplicateResults.length > 0) {
    showSimpleToast(`נמצאו ${duplicateResults.length} קבצים כפולים`);
  } else {
    showSimpleToast('לא נמצאו קבצים כפולים');
  }
}

// *** השוואה על בסיס הטקסט שנשלף מה-PDF ***
function findDuplicatesByExtractedText() {
  // קיבוץ טקסטים לפי קובץ
  const fileTextMap = {};
  
  extractedTexts.forEach(function(textItem) {
    if (!fileTextMap[textItem.fileIndex]) {
      fileTextMap[textItem.fileIndex] = {
        fileName: textItem.fileName,
        allTexts: [],
        significantTexts: []
      };
    }
    
    const cleanText = textItem.text.toLowerCase().trim();
    fileTextMap[textItem.fileIndex].allTexts.push(cleanText);
    
    // רק טקסטים משמעותיים לחישוב הדמיון
    if (isSignificantText(cleanText)) {
      fileTextMap[textItem.fileIndex].significantTexts.push(cleanText);
    }
  });
  
  const fileIndexes = Object.keys(fileTextMap).map(Number);
  
  // השוואה בין כל זוג קבצים
  for (let i = 0; i < fileIndexes.length; i++) {
    for (let j = i + 1; j < fileIndexes.length; j++) {
      const file1Index = fileIndexes[i];
      const file2Index = fileIndexes[j];
      
      const file1Data = fileTextMap[file1Index];
      const file2Data = fileTextMap[file2Index];
      
      // חישוב דמיון על בסיס הטקסט שנשלף
      const similarity = calculateExtractedTextSimilarity(file1Data, file2Data);
      
      console.log(`השוואת טקסט: ${file1Data.fileName} ⟷ ${file2Data.fileName}: ${(similarity * 100).toFixed(1)}%`);
      
      // נחשב כפול רק אם יש דמיון של 100% (או קרוב מאוד)
      if (similarity >= 0.98) { // 98% כדי לאפשר הבדלים זעירים ברווחים
        console.log(`✅ כפול נמצא: ${file1Data.fileName} ⟷ ${file2Data.fileName} (${(similarity * 100).toFixed(1)}% דמיון)`);
        
        if (!duplicateResults.includes(file1Index)) {
          duplicateResults.push(file1Index);
        }
        if (!duplicateResults.includes(file2Index)) {
          duplicateResults.push(file2Index);
        }
      }
    }
  }
}

// *** חישוב דמיון בין טקסטים שנשלפו - דמיון מושלם בלבד ***
function calculateExtractedTextSimilarity(file1Data, file2Data) {
  const sig1 = file1Data.significantTexts;
  const sig2 = file2Data.significantTexts;
  
  // בדיקה שיש מספיק טקסט לבדיקה
  if (sig1.length < 5 || sig2.length < 5) {
    console.log(`לא מספיק טקסט משמעותי: ${file1Data.fileName}(${sig1.length}) vs ${file2Data.fileName}(${sig2.length})`);
    return 0;
  }
  
  // בדיקה שיש אותה כמות טקסטים (בערך)
  const lengthDiff = Math.abs(sig1.length - sig2.length);
  const maxLength = Math.max(sig1.length, sig2.length);
  if (lengthDiff > maxLength * 0.1) { // יותר מ-10% הבדל בכמות הטקסטים
    console.log(`הבדל גדול בכמות הטקסטים: ${sig1.length} vs ${sig2.length}`);
    return 0;
  }
  
  // חישוב התאמות מדויקות בלבד - ללא התאמות חלקיות
  let exactMatches = 0;
  
  sig1.forEach(function(text1) {
    if (sig2.includes(text1)) {
      exactMatches++;
    }
  });
  
  // חישוב הדמיון - רק התאמות מדויקות
  const similarity1 = exactMatches / sig1.length;
  const similarity2 = exactMatches / sig2.length;
  
  // הדמיון הוא הממוצע של שני הכיוונים (כדי לוודא דמיון דו-כיווני)
  const finalSimilarity = (similarity1 + similarity2) / 2;
  
  console.log(`פירוט דמיון מדויק: ${exactMatches} התאמות מתוך ${sig1.length}/${sig2.length} טקסטים = ${(finalSimilarity * 100).toFixed(1)}%`);
  
  return finalSimilarity;
}

// *** בדיקת התאמה חלקית בין טקסטים ***
function isPartialTextMatch(text1, text2) {
  if (text1.length < 4 || text2.length < 4) return false;
  
  // אם אחד מכיל את השני ברוב התווים
  const minLength = Math.min(text1.length, text2.length);
  const maxLength = Math.max(text1.length, text2.length);
  
  if (minLength / maxLength < 0.6) return false; // פחות מ-60% חפיפה
  
  return text1.includes(text2) || text2.includes(text1);
}



// *** בדיקה אם טקסט משמעותי ***
function isSignificantText(text) {
  // מסנן טקסטים גנריים ולא משמעותיים
  
  // טקסטים קצרים מדי
  if (text.length < 4) return false;
  
  // טקסטים גנריים נפוצים
  const genericTexts = [
    'drawing', 'dwg', 'sheet', 'scale', 'date', 'revision',
    'material', 'qty', 'quantity', 'notes', 'title', 'project',
    'חומר', 'כמות', 'תאריך', 'קנה מידה', 'הערות', 'פרוייקט',
    'name', 'number', 'size', 'length', 'width', 'height',
    'mm', 'cm', 'inch', 'מ"מ', 'ס"מ', 'מטר'
  ];
  
  if (genericTexts.some(generic => text.includes(generic))) {
    return false;
  }
  
  // רק רווחים או מספרים
  if (/^[\s\d\.\-\/]+$/.test(text)) return false;
  
  // רק אותיות בודדות או סימנים
  if (/^[a-z\u0590-\u05ff]{1,2}$/.test(text)) return false;
  
  // מילים יחידות נפוצות
  const commonWords = [
    'the', 'and', 'or', 'of', 'to', 'for', 'in', 'on', 'at',
    'על', 'של', 'את', 'עם', 'או', 'וגם', 'כל', 'זה', 'זו'
  ];
  
  if (commonWords.includes(text)) return false;
  
  return true;
}

// *** חישוב דמיון בין קבצים ***
function calculateTextSimilarity(file1Data, file2Data) {
  const sig1 = file1Data.significantTexts;
  const sig2 = file2Data.significantTexts;
  
  // אם אין מספיק טקסטים משמעותיים
  if (sig1.length < 5 || sig2.length < 5) {
    return 0;
  }
  
  // חישוב חפיפה
  let commonSignificant = 0;
  let totalChecked = 0;
  
  sig1.forEach(function(text1) {
    totalChecked++;
    if (sig2.includes(text1)) {
      commonSignificant++;
    } else {
      // בדיקת דמיון חלקי
      sig2.forEach(function(text2) {
        if (isPartialMatch(text1, text2)) {
          commonSignificant += 0.7; // נקודות חלקיות
        }
      });
    }
  });
  
  // חישוב אחוז הדמיון
  const similarity = commonSignificant / Math.max(sig1.length, sig2.length);
  
  return Math.min(similarity, 1.0); // מוגבל ל-100%
}

// *** בדיקת התאמה חלקית ***
function isPartialMatch(text1, text2) {
  if (text1.length < 5 || text2.length < 5) return false;
  
  // אם אחד מכיל את השני (לפחות 70% מהטקסט)
  const minLength = Math.min(text1.length, text2.length);
  const maxLength = Math.max(text1.length, text2.length);
  
  if (minLength / maxLength < 0.7) return false;
  
  return text1.includes(text2) || text2.includes(text1);
}

// *** חיפוש טקסטים מתקדם עם זיהוי רצפים ***
function searchTexts() {
  const searchInput = document.getElementById('simpleSearchInput');
  const searchTerm = searchInput.value.trim();
  
  if (!searchTerm) {
    showSimpleToast('הכנס טקסט לחיפוש');
    searchInput.focus();
    return;
  }
  
  if (extractedTexts.length === 0) {
    showSimpleToast('הרץ שליפת טקסטים תחילה');
    return;
  }
  
  searchResults = [];
  isSimpleSearchMode = true;
  isSimpleDuplicateMode = false;
  
  // חיפוש מתקדם - תומך ברצפי מילים
  const foundFileIndexes = new Set();
  const searchResults_detailed = [];
  
  if (searchTerm.includes(' ')) {
    // חיפוש רצף מילים צמוד
    searchSequence(searchTerm, foundFileIndexes, searchResults_detailed);
  } else {
    // חיפוש מילה יחידה
    searchSingleWord(searchTerm, foundFileIndexes, searchResults_detailed);
  }
  
  searchResults = Array.from(foundFileIndexes);
  
  // עדכון בחירה וטבלה
  updateSimpleSelection(searchResults);
  setActiveSimpleButton('simpleSearchBtn');
  
  // הודעה מפורטת
  if (searchResults.length > 0) {
    const matchCount = searchResults_detailed.length;
    showSimpleToast(`נמצאו ${matchCount} התאמות ב-${searchResults.length} קבצים`);
    console.log('פירוט תוצאות חיפוש:', searchResults_detailed);
  } else {
    showSimpleToast(`לא נמצאו קבצים עם "${searchTerm}"`);
  }
}

// *** חיפוש רצף מילים צמוד ***
function searchSequence(searchTerm, foundFileIndexes, searchResults_detailed) {
  const searchWords = searchTerm.toLowerCase().trim().split(/\s+/);
  const sequenceLength = searchWords.length;
  
  // קיבוץ טקסטים לפי קובץ ועמוד למציאת רצפים
  const filePageMap = {};
  
  extractedTexts.forEach(function(textItem) {
    const key = `${textItem.fileIndex}_${textItem.page}`;
    if (!filePageMap[key]) {
      filePageMap[key] = {
        fileIndex: textItem.fileIndex,
        fileName: textItem.fileName,
        page: textItem.page,
        texts: []
      };
    }
    filePageMap[key].texts.push({
      text: textItem.text.toLowerCase(),
      x: textItem.x,
      y: textItem.y,
      original: textItem.text
    });
  });
  
  // חיפוש רצפים בכל עמוד
  Object.values(filePageMap).forEach(function(pageData) {
    // מיון לפי מיקום (מלמעלה למטה, ומשמאל לימין)
    pageData.texts.sort(function(a, b) {
      if (Math.abs(a.y - b.y) < 10) { // אותה שורה בערך
        return a.x - b.x; // מיון לפי X
      }
      return b.y - a.y; // מיון לפי Y (מלמעלה למטה)
    });
    
    // חיפוש רצף במקטעים
    for (let i = 0; i <= pageData.texts.length - sequenceLength; i++) {
      const segment = pageData.texts.slice(i, i + sequenceLength);
      
      // בדיקה אם הרצף קרוב מספיק מבחינת מיקום
      if (isCloseSequence(segment)) {
        const segmentWords = segment.map(t => t.text.trim()).filter(t => t);
        
        // בדיקה אם מתאים לחיפוש
        if (matchesSearchSequence(segmentWords, searchWords)) {
          foundFileIndexes.add(pageData.fileIndex);
          searchResults_detailed.push({
            fileName: pageData.fileName,
            page: pageData.page,
            foundText: segment.map(t => t.original).join(' '),
            searchTerm: searchTerm,
            position: { x: segment[0].x, y: segment[0].y }
          });
          break; // נמצא ברצף הזה, עבור לרצף הבא
        }
      }
    }
  });
}

// *** בדיקה אם טקסטים קרובים זה לזה ***
function isCloseSequence(segment) {
  if (segment.length < 2) return true;
  
  for (let i = 1; i < segment.length; i++) {
    const prev = segment[i-1];
    const curr = segment[i];
    
    // המרחק לא יכול להיות גדול מדי
    const distance = Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2));
    
    if (distance > 200) { // 200 פיקסלים מקסימום
      return false;
    }
  }
  
  return true;
}

// *** בדיקה אם רצף מתאים לחיפוש ***
function matchesSearchSequence(segmentWords, searchWords) {
  if (segmentWords.length !== searchWords.length) return false;
  
  for (let i = 0; i < searchWords.length; i++) {
    if (!segmentWords[i].includes(searchWords[i])) {
      return false;
    }
  }
  
  return true;
}

// *** חיפוש מילה יחידה ***
function searchSingleWord(searchTerm, foundFileIndexes, searchResults_detailed) {
  const searchLower = searchTerm.toLowerCase();
  
  extractedTexts.forEach(function(textItem) {
    if (textItem.text.toLowerCase().includes(searchLower)) {
      foundFileIndexes.add(textItem.fileIndex);
      
      // הוסף לתוצאות מפורטות אם עוד לא קיים
      const existing = searchResults_detailed.find(r => 
        r.fileName === textItem.fileName && 
        r.page === textItem.page &&
        r.foundText === textItem.text
      );
      
      if (!existing) {
        searchResults_detailed.push({
          fileName: textItem.fileName,
          page: textItem.page,
          foundText: textItem.text,
          searchTerm: searchTerm,
          position: { x: textItem.x, y: textItem.y }
        });
      }
    }
  });
}

// *** עדכון בחירה וסימון ***
function updateSimpleSelection(resultIndexes) {
  // ניקוי בחירות קודמות
  if (typeof window.clearAllSelections === 'function') {
    window.clearAllSelections();
  }
  
  // עדכון בחירה
  if (typeof window.selectedRows !== 'undefined') {
    window.selectedRows = resultIndexes.slice();
  }
  
  // עדכון מונה
  updateSimpleCounter(resultIndexes.length);
  
  // עדכון טבלה
  if (typeof window.renderTable === 'function') {
    window.renderTable();
  }
  
  if (typeof window.updateSearchInfo === 'function') {
    window.updateSearchInfo();
  }
}

// *** ניקוי כל הסינונים ***
function clearSimpleFilters() {
  searchResults = [];
  duplicateResults = [];
  isSimpleSearchMode = false;
  isSimpleDuplicateMode = false;
  isClassificationMode = false;
  currentClassificationMode = null;
  
  // ניקוי שדה חיפוש
  const searchInput = document.getElementById('simpleSearchInput');
  if (searchInput) {
    searchInput.value = '';
  }
  
  // ניקוי בחירות
  if (typeof window.clearAllSelections === 'function') {
    window.clearAllSelections();
  }
  
  // ניקוי כפתורים פעילים
  clearActiveSimpleButtons();
  
  // עדכון מונה
  updateSimpleCounter(0);
  
  // עדכון טבלה
  if (typeof window.renderTable === 'function') {
    window.renderTable();
  }
  
  showSimpleToast('כל הסינונים והסיווגים נוקו');
}

// *** עדכון מונה תוצאות ***
function updateSimpleCounter(count) {
  const counter = document.getElementById('simpleResultsCount');
  if (counter) {
    counter.textContent = count.toString();
    
    // צביעה לפי כמות
    if (count > 0) {
      counter.style.color = '#28a745';
      counter.style.fontWeight = 'bold';
    } else {
      counter.style.color = '#6c757d';
      counter.style.fontWeight = 'normal';
    }
  }
}

// *** ניהול כפתורים פעילים ***
function setActiveSimpleButton(buttonId) {
  clearActiveSimpleButtons();
  const button = document.getElementById(buttonId);
  if (button) {
    button.classList.add('simple-active');
  }
}

function clearActiveSimpleButtons() {
  const buttons = document.querySelectorAll('.simple-feature');
  buttons.forEach(function(btn) {
    btn.classList.remove('simple-active');
  });
}

// *** פונקציות עזר ***
function showSimpleToast(message, duration = 3000) {
  if (typeof window.showToast === 'function') {
    window.showToast('🔧 ' + message, duration);
  } else {
    console.log('Simple Toast:', message);
  }
}

// *** סטיילים פשוטים ***
function addSimpleStyles() {
  if (document.getElementById('simpleStyles')) return;
  
  const style = document.createElement('style');
  style.id = 'simpleStyles';
  style.textContent = `
    .simple-feature {
      background: linear-gradient(135deg, #17a2b8, #138496) !important;
      color: white !important;
      border: none !important;
      transition: all 0.2s ease !important;
    }
    
    .simple-feature:hover {
      transform: translateY(-1px) !important;
      box-shadow: 0 4px 8px rgba(23, 162, 184, 0.3) !important;
    }
    
    .simple-active {
      background: linear-gradient(135deg, #28a745, #20c997) !important;
      box-shadow: 0 0 10px rgba(40, 167, 69, 0.5) !important;
    }
    
    .simple-clear {
      background: linear-gradient(135deg, #6c757d, #545b62) !important;
      color: white !important;
      border: none !important;
    }
    
    .simple-clear:hover {
      background: linear-gradient(135deg, #5a6268, #495057) !important;
    }
    
    .simple-counter {
      background: #f8f9fa !important;
      border: 2px solid #dee2e6 !important;
      border-radius: 4px !important;
      padding: 8px 12px !important;
      text-align: center !important;
      min-width: 80px !important;
    }
    
    .simple-counter .counter-label {
      font-size: 11px !important;
      color: #6c757d !important;
      margin-bottom: 2px !important;
    }
    
    .simple-counter .counter-value {
      font-size: 18px !important;
      font-weight: bold !important;
      color: #495057 !important;
    }
    
    /* הדגשת שורות שנמצאו */
    .table-container tr.selected {
      background-color: #d1ecf1 !important;
      border-left: 4px solid #17a2b8 !important;
    }
    
    /* אנימציה לכפתורים פעילים */
    .simple-active::after {
      content: '✓';
      position: absolute;
      top: 2px;
      right: 4px;
      font-size: 12px;
      color: white;
      font-weight: bold;
    }
    
    /* כפתור סיווגים */
    .classification-feature {
      background: linear-gradient(135deg, #fd7e14, #e8590c) !important;
      color: white !important;
      border: none !important;
      transition: all 0.2s ease !important;
    }
    
    .classification-feature:hover {
      transform: translateY(-1px) !important;
      box-shadow: 0 4px 8px rgba(253, 126, 20, 0.3) !important;
    }
  `;
  
  document.head.appendChild(style);
}

// *** פונקציות ניהול סיווגים ***

function showClassificationPopup() {
  // יצירת חלון הגדרות סיווג
  let popup = document.getElementById('classificationPopup');
  if (popup) {
    popup.remove();
  }
  
  popup = document.createElement('div');
  popup.id = 'classificationPopup';
  popup.className = 'popup-overlay';
  popup.style.display = 'block';
  
  popup.innerHTML = `
    <div class="popup-window" style="max-width: 600px;">
      <div class="popup-header">
        <div class="popup-title">🏷️ ניהול סיווגים</div>
        <button class="popup-close" onclick="closeClassificationPopup()">&times;</button>
      </div>
      <div class="popup-body">
        <div style="margin-bottom: 15px;">
          <h4 style="margin: 0 0 10px 0; color: #333;">הוסף סיווג חדש:</h4>
          <div style="display: flex; gap: 8px; margin-bottom: 10px;">
            <input type="text" id="newClassificationName" placeholder="שם הסיווג (לדוגמה: חומרי מתכת)"
                   style="flex: 2; padding: 6px; border: 1px solid #ccc; border-radius: 4px;">
            <input type="text" id="newClassificationTerms" placeholder="מילות חיפוש (לדוגמה: אלומיניום,פלדה,ברזל)"
                   style="flex: 3; padding: 6px; border: 1px solid #ccc; border-radius: 4px;">
            <button onclick="addClassification()" class="popup-btn" style="background: #28a745;">הוסף</button>
          </div>
          <small style="color: #666;">הפרד מילות חיפוש בפסיקים. הסיווג יחפש קבצים המכילים אחת או יותר מהמילים.</small>
        </div>
        
        <div style="border-top: 1px solid #ddd; padding-top: 15px;">
          <h4 style="margin: 0 0 10px 0; color: #333;">סיווגים קיימים:</h4>
          <div id="classificationList" style="max-height: 200px; overflow-y: auto;">
            <!-- רשימת סיווגים תוצג כאן -->
          </div>
        </div>
        
        <div style="border-top: 1px solid #ddd; padding-top: 15px;">
          <h4 style="margin: 0 0 10px 0; color: #333;">החל סיווג:</h4>
          <div id="applyClassificationList">
            <!-- כפתורי סיווג יוצגו כאן -->
          </div>
        </div>
        
        <div style="border-top: 1px solid #ddd; padding-top: 15px;">
          <button onclick="addClassificationColumnManually()" class="popup-btn" 
                  style="background: #17a2b8; color: white; width: 100%; padding: 8px;">
            ➕ הוסף עמודת סיווג לטבלה
          </button>
          <small style="color: #666; display: block; margin-top: 5px;">
            לחץ אם עמודת הסיווג לא מופיעה בטבלה
          </small>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(popup);
  
  // טעינת הסיווגים הקיימים
  loadClassificationSettings();
  updateClassificationDisplay();
}

function closeClassificationPopup() {
  const popup = document.getElementById('classificationPopup');
  if (popup) {
    popup.remove();
  }
}

function addClassification() {
  const nameInput = document.getElementById('newClassificationName');
  const termsInput = document.getElementById('newClassificationTerms');
  
  const name = nameInput.value.trim();
  const terms = termsInput.value.trim();
  
  if (!name || !terms) {
    showSimpleToast('אנא מלא את שם הסיווג ומילות החיפוש');
    return;
  }
  
  // בדיקה שהסיווג לא קיים
  if (classificationSettings.find(c => c.name === name)) {
    showSimpleToast('סיווג בשם זה כבר קיים');
    return;
  }
  
  // הוספת הסיווג
  const classification = {
    name: name,
    terms: terms.split(',').map(t => t.trim().toLowerCase()).filter(t => t),
    id: 'class_' + Date.now()
  };
  
  classificationSettings.push(classification);
  saveClassificationSettings();
  
  // ניקוי השדות
  nameInput.value = '';
  termsInput.value = '';
  
  updateClassificationDisplay();
  showSimpleToast(`סיווג "${name}" נוסף בהצלחה`);
}

function deleteClassification(classificationId) {
  if (confirm('האם למחוק את הסיווג הזה?')) {
    classificationSettings = classificationSettings.filter(c => c.id !== classificationId);
    saveClassificationSettings();
    updateClassificationDisplay();
    showSimpleToast('סיווג נמחק');
  }
}

function updateClassificationDisplay() {
  const listContainer = document.getElementById('classificationList');
  const applyContainer = document.getElementById('applyClassificationList');
  
  if (!listContainer || !applyContainer) return;
  
  // רשימת סיווגים קיימים
  if (classificationSettings.length === 0) {
    listContainer.innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">אין סיווגים</div>';
  } else {
    listContainer.innerHTML = classificationSettings.map(c => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border: 1px solid #eee; margin-bottom: 5px; border-radius: 4px;">
        <div>
          <strong>${c.name}</strong><br>
          <small style="color: #666;">מילות חיפוש: ${c.terms.join(', ')}</small>
        </div>
        <button onclick="deleteClassification('${c.id}')" class="popup-btn" style="background: #dc3545;">מחק</button>
      </div>
    `).join('');
  }
  
  // כפתורי החלת סיווג
  if (classificationSettings.length === 0) {
    applyContainer.innerHTML = '<div style="text-align: center; color: #999;">הוסף סיווגים כדי להשתמש בהם</div>';
  } else {
    applyContainer.innerHTML = classificationSettings.map(c => `
      <button onclick="applyClassification('${c.id}')" class="popup-btn" style="margin: 3px; background: #fd7e14;">
        החל: ${c.name}
      </button>
    `).join('');
  }
}

function applyClassification(classificationId) {
  const classification = classificationSettings.find(c => c.id === classificationId);
  if (!classification) return;
  
  if (extractedTexts.length === 0) {
    showSimpleToast('הרץ שליפת טקסטים תחילה');
    return;
  }
  
  // חיפוש קבצים לפי הסיווג
  const foundFileIndexes = new Set();
  
  extractedTexts.forEach(function(textItem) {
    const textLower = textItem.text.toLowerCase();
    
    // בדיקה אם הטקסט מכיל אחת ממילות החיפוש
    const hasMatch = classification.terms.some(term => textLower.includes(term));
    
    if (hasMatch) {
      foundFileIndexes.add(textItem.fileIndex);
    }
  });
  
  searchResults = Array.from(foundFileIndexes);
  isClassificationMode = true;
  currentClassificationMode = classification.name;
  isSimpleSearchMode = false;
  isSimpleDuplicateMode = false;
  
  // סגירת החלון
  closeClassificationPopup();
  
  // עדכון בחירה וטבלה
  updateSimpleSelection(searchResults);
  setActiveClassificationButton();
  
  const message = `סיווג "${classification.name}": נמצאו ${searchResults.length} קבצים`;
  showSimpleToast(message);
  
  console.log('🏷️ תוצאות סיווג:', {
    classification: classification.name,
    terms: classification.terms,
    filesFound: searchResults.length,
    files: searchResults
  });
}

function setActiveClassificationButton() {
  clearActiveSimpleButtons();
  // יצירת אינדיקטור חזותי לסיווג פעיל
  if (currentClassificationMode) {
    showSimpleToast(`סיווג פעיל: ${currentClassificationMode}`, 5000);
  }
}

function saveClassificationSettings() {
  try {
    localStorage.setItem('pdfClassificationSettings', JSON.stringify(classificationSettings));
  } catch (e) {
    console.warn('לא ניתן לשמור הגדרות סיווג:', e);
  }
}

function loadClassificationSettings() {
  try {
    const stored = localStorage.getItem('pdfClassificationSettings');
    if (stored) {
      classificationSettings = JSON.parse(stored);
    }
  } catch (e) {
    console.warn('לא ניתן לטעון הגדרות סיווג:', e);
    classificationSettings = [];
  }
}

console.log('✅ תוספת פשוטה נטענה - שליפה + כפילות + חיפוש + סימון + סינון');