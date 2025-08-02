import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Download, Upload, HelpCircle, CheckCircle, AlertTriangle, FileText } from 'lucide-react';

const DQScoringInterface = () => {
  // Sample conversation data (cleaned up)
  const [conversationData, setConversationData] = useState([
    { turn: 1, speaker: "Coach", text: "Hi Jamie, I'm Chris and I'm going to be your decision coach. I'm looking forward to seeing what's going on with you." },
    { turn: 1, speaker: "Jamie", text: "Yeah, so as I said, I am a mechanical engineering student and I'm a first-generation immigrant in the United States. But recently I found a very strong passion in design and art and I feel I should go to that route instead of mechanical engineering, but I don't know what to do. I'm just a little scared of making this big jump." },
    { turn: 2, speaker: "Coach", text: "So tell me more about what it is that you like about the design and the art." },
    { turn: 2, speaker: "Jamie", text: "I saw someone who's an artist, but he also practiced design thinking, trying to understand the true needs of humans and he's been very successful too. So you know, how he combines a very creative aesthetic artistic mindset with the true skills of understanding people - that is something I really love and I find that really inspiring." }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState({});
  const [showHelp, setShowHelp] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [progress, setProgress] = useState(0);
  const [qualityIssues, setQualityIssues] = useState({});
  const [fileName, setFileName] = useState("Sample Conversation");
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [csvData, setCsvData] = useState('');

  // DQ Elements and their definitions
  const dqElements = {
    UF: { name: "Useful Framing", color: "bg-blue-100 text-blue-800" },
    MA: { name: "Meaningful Alternatives", color: "bg-green-100 text-green-800" },
    RI: { name: "Reliable Information", color: "bg-yellow-100 text-yellow-800" },
    CVT: { name: "Clear Values & Tradeoffs", color: "bg-purple-100 text-purple-800" },
    SR: { name: "Sound Reasoning", color: "bg-orange-100 text-orange-800" },
    CA: { name: "Commitment to Action", color: "bg-red-100 text-red-800" }
  };

  const utteranceTypes = [
    "Open Question", "Focused Question", "Reflective Question", "Validation", 
    "Challenge", "Reframe", "Summary", "Directive", "Information", "Process"
  ];

  const emotionalTones = [
    "Anxious", "Excited", "Confused", "Confident", "Frustrated", "Curious",
    "Reflective", "Neutral", "Relieved", "Determined", "Grateful", "Vulnerable"
  ];

  const cognitiveStates = [
    "Exploration", "Analysis", "Synthesis", "Clarification", "Commitment",
    "Reflection", "Confusion", "Insight", "Resistance", "Integration"
  ];

  const observedChanges = [
    "Reframe", "Expand", "Focus", "Clarify", "Commit", "Explore",
    "Integrate", "Prioritize", "Resolve", "Activate", "None"
  ];

  // Quality checking function
  const checkTextQuality = (text) => {
    const issues = [];
    
    if (/\b(\w+)\s+\1\b/i.test(text)) {
      issues.push("Repeated words detected");
    }
    
    if (text.includes("...") || /\b(the the|a a|is is|and and)\b/i.test(text)) {
      issues.push("Potential transcription errors");
    }
    
    const sentences = text.split(/[.!?]+/);
    if (sentences.some(s => s.length > 200)) {
      issues.push("Very long sentences - may need breaking up");
    }
    
    if (text.trim().endsWith("and") || text.trim().endsWith("but") || text.trim().endsWith("or")) {
      issues.push("Sentence appears incomplete");
    }
    
    return issues;
  };

  // Enhanced CSV parsing function that handles multi-line quoted fields
  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i += 2;
          continue;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
        i++;
        continue;
      } else {
        current += char;
      }
      i++;
    }
    
    result.push(current.trim());
    return result;
  };

  // Robust CSV parser that handles multi-line quoted fields
  const parseCSVRows = (text) => {
    const lines = text.split('\n');
    const rows = [];
    let currentRow = '';
    let inQuotes = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Count quotes in this line to determine if we're inside a quoted field
      const quoteCount = (line.match(/"/g) || []).length;
      
      if (currentRow === '') {
        // Starting a new row
        currentRow = line;
        inQuotes = (quoteCount % 2 === 1); // Odd number of quotes means we're inside quotes
      } else {
        // Continuing a row that spans multiple lines
        currentRow += '\n' + line;
        inQuotes = inQuotes !== (quoteCount % 2 === 1); // Toggle quote state based on quote count
      }
      
      // If we're not inside quotes and the row isn't empty, we have a complete row
      if (!inQuotes && currentRow.trim() !== '') {
        rows.push(currentRow);
        currentRow = '';
      }
    }
    
    // Don't forget the last row if it exists
    if (currentRow.trim() !== '') {
      rows.push(currentRow);
    }
    
    return rows.filter(row => row.trim() !== '');
  };

  // Updated standardized CSV parser with better multi-line handling
  const parseStandardizedCSV = (text) => {
    console.log('=== PARSING CSV WITH MULTI-LINE SUPPORT ===');
    
    const rows = parseCSVRows(text);
    console.log(`Parsed ${rows.length} rows from CSV`);
    
    if (rows.length < 2) {
      throw new Error('CSV file appears to be empty or has no data rows');
    }

    // Parse and validate headers
    const headers = parseCSVLine(rows[0]);
    const expectedHeaders = ['conversation_id', 'turn_number', 'speaker', 'utterance'];
    
    console.log('CSV Headers found:', headers);
    
    if (headers.length !== expectedHeaders.length) {
      throw new Error(`Header count mismatch. Expected 4 columns: ${expectedHeaders.join(', ')}\nFound ${headers.length} columns: ${headers.join(', ')}`);
    }
    
    for (let i = 0; i < expectedHeaders.length; i++) {
      if (headers[i] !== expectedHeaders[i]) {
        throw new Error(`Header mismatch at column ${i + 1}. Expected "${expectedHeaders[i]}", found "${headers[i]}"\n\nRequired headers (case-sensitive): ${expectedHeaders.join(', ')}`);
      }
    }

    console.log('✓ Headers validated successfully');

    // Parse data rows
    const conversations = [];
    const issues = {};
    const conversationData = new Map();
    let rowErrors = [];

    for (let i = 1; i < rows.length; i++) {
      const cells = parseCSVLine(rows[i]);
      const rowNum = i + 1;
      
      console.log(`Processing row ${rowNum}: ${cells.length} columns`);
      
      if (cells.length !== 4) {
        console.log(`Row ${rowNum} content:`, rows[i].substring(0, 100) + '...');
        rowErrors.push(`Row ${rowNum}: Expected 4 columns, found ${cells.length}. Content: "${rows[i].substring(0, 50)}..."`);
        continue;
      }

      const [conversationId, turnNumberStr, speaker, utterance] = cells;

      // Validate conversation_id
      if (!conversationId || conversationId.trim() === '') {
        rowErrors.push(`Row ${rowNum}: conversation_id cannot be empty`);
        continue;
      }

      // Validate and parse turn_number
      const turnNumber = parseInt(turnNumberStr);
      if (isNaN(turnNumber) || turnNumber < 1) {
        rowErrors.push(`Row ${rowNum}: turn_number must be a positive integer, found "${turnNumberStr}"`);
        continue;
      }

      // Validate speaker (exact whitelist)
      if (speaker !== 'coach' && speaker !== 'jamie') {
        rowErrors.push(`Row ${rowNum}: speaker must be exactly "coach" or "jamie", found "${speaker}"`);
        continue;
      }

      // Validate utterance
      if (!utterance || utterance.trim() === '') {
        rowErrors.push(`Row ${rowNum}: utterance cannot be empty`);
        continue;
      }

      // Track turn sequence validation
      if (!conversationData.has(conversationId)) {
        conversationData.set(conversationId, { lastTurn: 0, turns: [] });
      }
      
      const convData = conversationData.get(conversationId);
      
      // Check turn number sequence (should increment by 1)
      if (turnNumber !== convData.lastTurn + 1) {
        rowErrors.push(`Row ${rowNum}: turn_number ${turnNumber} does not follow sequence (expected ${convData.lastTurn + 1}) for conversation "${conversationId}"`);
        continue;
      }
      
      convData.lastTurn = turnNumber;
      convData.turns.push(rowNum);

      // Quality check the utterance text
      const qualityCheck = checkTextQuality(utterance.trim());
      
      // Create conversation entry
      const conversationEntry = {
        turn: turnNumber,
        speaker: speaker === 'coach' ? 'Coach' : 'Jamie',
        text: utterance.trim(),
        conversationId: conversationId,
        originalRow: rowNum
      };

      conversations.push(conversationEntry);

      // Store quality issues if any
      if (qualityCheck.length > 0) {
        issues[conversations.length - 1] = qualityCheck;
      }
    }

    // Report any validation errors (but only show first 5 for readability)
    if (rowErrors.length > 0) {
      console.log('All row errors:', rowErrors);
      const errorSummary = `Found ${rowErrors.length} validation error(s):\n\n${rowErrors.slice(0, 5).join('\n')}${rowErrors.length > 5 ? `\n... and ${rowErrors.length - 5} more errors\n\nPlease check your CSV file for:\n• Multi-line text properly quoted\n• No missing commas\n• Consistent column structure` : ''}`;
      throw new Error(errorSummary);
    }

    if (conversations.length === 0) {
      throw new Error('No valid conversation data found after validation');
    }

    // Log success statistics
    const conversationIds = new Set(conversations.map(c => c.conversationId));
    const coachCount = conversations.filter(c => c.speaker === 'Coach').length;
    const jamieCount = conversations.filter(c => c.speaker === 'Jamie').length;
    
    console.log('✓ CSV parsing successful:');
    console.log(`  - ${conversationIds.size} conversation(s): ${Array.from(conversationIds).join(', ')}`);
    console.log(`  - ${conversations.length} total utterances`);
    console.log(`  - ${coachCount} coach utterances, ${jamieCount} jamie utterances`);
    console.log(`  - ${Object.keys(issues).length} quality issues detected`);

    return { conversations, issues };
  };

  // Legacy format detector
  const detectLegacyFormat = (headers) => {
    const legacyPatterns = [
      ['Turn', 'Coach_Text', 'Jamie_Text'],
      ['Turn', 'Speaker', 'Text'],
      ['turn', 'coach_text', 'jamie_text'],
      ['turn', 'speaker', 'text']
    ];

    for (const pattern of legacyPatterns) {
      if (headers.length === pattern.length && 
          headers.every((header, i) => header.toLowerCase() === pattern[i].toLowerCase())) {
        return pattern.join(', ');
      }
    }

    return null;
  };

  // Word document parser (for backward compatibility)
  const parseWordDocument = async (arrayBuffer) => {
    try {
      console.log('Attempting to parse Word document...');
      
      let mammoth;
      try {
        mammoth = await import('mammoth');
        console.log('Mammoth library loaded successfully');
      } catch (importError) {
        console.error('Mammoth library not available:', importError);
        throw new Error('Word document processing not available in this environment. Please convert to CSV format.');
      }
      
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;
      
      console.log('Text extracted successfully. Length:', text.length);
      
      if (!text || text.trim().length === 0) {
        throw new Error('No text content found in the Word document');
      }
      
      return parseConversationTextSimple(text);
      
    } catch (error) {
      console.error('Error parsing Word document:', error);
      throw error;
    }
  };

  // Simple conversation parser for Word documents
  const parseConversationTextSimple = (text) => {
    const conversations = [];
    const issues = {};
    
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let currentSpeaker = null;
    let currentUtterance = "";
    let turnNumber = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      const speakerMatch = line.match(/^(Jamie|Coach|Chris):\s*(.*)$/i);
      
      if (speakerMatch) {
        if (currentSpeaker && currentUtterance.trim()) {
          const speaker = currentSpeaker.charAt(0).toUpperCase() + currentSpeaker.slice(1).toLowerCase();
          const text = currentUtterance.trim();
          
          if (speaker === 'Coach') {
            turnNumber++;
          }
          
          const qualityCheck = checkTextQuality(text);
          conversations.push({
            turn: turnNumber || 1,
            speaker: speaker,
            text: text
          });
          
          if (qualityCheck.length > 0) {
            issues[conversations.length - 1] = qualityCheck;
          }
        }
        
        currentSpeaker = speakerMatch[1].toLowerCase() === 'chris' ? 'coach' : speakerMatch[1].toLowerCase();
        currentUtterance = speakerMatch[2];
        
      } else if (currentSpeaker && !line.match(/^(Conversation \d+:|Turn \d+:)/i)) {
        currentUtterance += " " + line;
      }
    }
    
    if (currentSpeaker && currentUtterance.trim()) {
      const speaker = currentSpeaker.charAt(0).toUpperCase() + currentSpeaker.slice(1).toLowerCase();
      const text = currentUtterance.trim();
      
      if (speaker === 'Coach') {
        turnNumber++;
      }
      
      const qualityCheck = checkTextQuality(text);
      conversations.push({
        turn: turnNumber || 1,
        speaker: speaker,
        text: text
      });
      
      if (qualityCheck.length > 0) {
        issues[conversations.length - 1] = qualityCheck;
      }
    }
    
    console.log(`Parsed ${conversations.length} utterances from Word document`);
    
    return { conversations, issues };
  };

  // File upload handler with enhanced debugging
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log('=== FILE UPLOAD DEBUG ===');
    console.log('File selected:', file.name);
    console.log('File size:', file.size);
    console.log('File type:', file.type);
    console.log('File last modified:', new Date(file.lastModified));
    
    setFileName(file.name);
    
    try {
      if (file.name.endsWith('.csv')) {
        console.log('Processing CSV file...');
        
        const text = await file.text();
        console.log('File text length:', text.length);
        console.log('First 200 characters:', text.substring(0, 200));
        
        const lines = text.split('\n').filter(line => line.trim());
        console.log('Total lines after filtering:', lines.length);
        
        if (lines.length === 0) {
          throw new Error('CSV file is empty');
        }

        const firstLine = parseCSVLine(lines[0]);
        console.log('Parsed first line:', firstLine);
        
        const expectedHeaders = ['conversation_id', 'turn_number', 'speaker', 'utterance'];
        console.log('Expected headers:', expectedHeaders);
        
        // Check each header individually
        console.log('Header comparison:');
        firstLine.forEach((header, i) => {
          const expected = expectedHeaders[i] || 'MISSING';
          const matches = header === expected;
          console.log(`  ${i}: "${header}" === "${expected}" ? ${matches}`);
        });
        
        if (firstLine.length === 4 && firstLine.every((header, i) => header === expectedHeaders[i])) {
          console.log('✓ Detected new standardized CSV format - calling parseStandardizedCSV');
          
          try {
            const { conversations, issues } = parseStandardizedCSV(text);
            console.log('parseStandardizedCSV returned:', conversations.length, 'conversations');
            
            // Debug the conversation data
            console.log('Sample conversations:');
            conversations.slice(0, 3).forEach((conv, i) => {
              console.log(`  ${i}: Turn ${conv.turn}, ${conv.speaker}: "${conv.text.substring(0, 50)}..."`);
            });
            
            console.log('Setting conversation data...');
            setConversationData(conversations);
            setQualityIssues(issues);
            setScores({});
            setCurrentIndex(0);
            
            console.log('State should be updated now');
            
            const conversationIds = new Set(conversations.map(c => c.conversationId));
            const coachCount = conversations.filter(c => c.speaker === 'Coach').length;
            const jamieCount = conversations.filter(c => c.speaker === 'Jamie').length;
            
            alert(`✓ Successfully loaded standardized CSV!\n\nConversations: ${Array.from(conversationIds).join(', ')}\nTotal utterances: ${conversations.length}\nCoach: ${coachCount}, Jamie: ${jamieCount}\n\n${Object.keys(issues).length > 0 ? `${Object.keys(issues).length} quality issues detected and flagged.` : 'No quality issues detected.'}`);
            
          } catch (parseError) {
            console.error('parseStandardizedCSV failed:', parseError);
            throw parseError;
          }
          
        } else {
          console.log('Headers do not match standardized format');
          const legacyFormat = detectLegacyFormat(firstLine);
          console.log('Legacy format detected:', legacyFormat);
          
          if (legacyFormat) {
            throw new Error(`❌ Legacy CSV format detected!\n\nFound headers: ${firstLine.join(', ')}\nThis appears to be the old "${legacyFormat}" format.\n\n🔧 REQUIRED ACTION:\nPlease convert your file to the new standardized format with these exact headers:\nconversation_id, turn_number, speaker, utterance\n\nContact your team lead for the "unpivot" conversion script.`);
          } else {
            throw new Error(`❌ Unrecognized CSV format!\n\nFound headers: ${firstLine.join(', ')}\n\n✅ Required headers (case-sensitive):\nconversation_id, turn_number, speaker, utterance\n\nPlease ensure your CSV file uses exactly these column names.`);
          }
        }
        
      } else if (file.name.endsWith('.docx')) {
        console.log('Processing Word document...');
        
        const arrayBuffer = await file.arrayBuffer();
        const { conversations, issues } = await parseWordDocument(arrayBuffer);
        
        if (conversations.length === 0) {
          alert('No conversation data found in the Word document. Please check the format:\n\nJamie: [text]\nCoach: [text]');
          return;
        }
        
        setConversationData(conversations);
        setQualityIssues(issues);
        setScores({});
        setCurrentIndex(0);
        
        alert(`Successfully loaded ${conversations.length} utterances from Word document!\n\nJamie: ${conversations.filter(c => c.speaker === 'Jamie').length} utterances\nCoach: ${conversations.filter(c => c.speaker === 'Coach').length} utterances\n\n⚠️  Note: For best results, please use the new standardized CSV format.`);
        
      } else {
        alert('❌ Unsupported file type!\n\n✅ Supported formats:\n• .csv files (new standardized format)\n• .docx files (legacy support)\n\n📋 Required CSV format:\nconversation_id, turn_number, speaker, utterance');
      }
    } catch (error) {
      console.error('=== FILE UPLOAD ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      alert(`File Upload Error:\n\n${error.message}`);
    }
    
    console.log('=== FILE UPLOAD COMPLETE ===');
  };

  const currentUtterance = conversationData[currentIndex];
  const isCoach = currentUtterance?.speaker === "Coach";
  const utteranceId = `${currentUtterance?.turn}-${currentUtterance?.speaker}`;
  const hasQualityIssues = qualityIssues[currentIndex];

  // Calculate progress
  useEffect(() => {
    const totalUtterances = conversationData.length;
    const scoredUtterances = Object.keys(scores).length;
    setProgress((scoredUtterances / totalUtterances) * 100);
  }, [scores, conversationData]);

  // Initialize score for current utterance
  useEffect(() => {
    if (!scores[utteranceId]) {
      if (isCoach) {
        setScores(prev => ({
          ...prev,
          [utteranceId]: {
            dqElements: [],
            utteranceType: "",
            dqScores: {},
            overallScore: 0,
            rationale: ""
          }
        }));
      } else {
        setScores(prev => ({
          ...prev,
          [utteranceId]: {
            emotionalTone: "",
            cognitiveState: "",
            decisionProgress: false,
            observedChange: "",
            changeIntensity: 3,
            notes: ""
          }
        }));
      }
    }
  }, [currentIndex, utteranceId, isCoach, scores]);

  const updateScore = (field, value) => {
    setScores(prev => ({
      ...prev,
      [utteranceId]: {
        ...prev[utteranceId],
        [field]: value
      }
    }));
  };

  const updateDQScore = (element, score) => {
    setScores(prev => ({
      ...prev,
      [utteranceId]: {
        ...prev[utteranceId],
        dqScores: {
          ...prev[utteranceId]?.dqScores,
          [element]: score
        }
      }
    }));
  };

  const toggleDQElement = (element) => {
    const currentElements = scores[utteranceId]?.dqElements || [];
    const newElements = currentElements.includes(element)
      ? currentElements.filter(e => e !== element)
      : [...currentElements, element];
    
    updateScore('dqElements', newElements);
  };

  const calculateOverallScore = () => {
    const currentScore = scores[utteranceId];
    if (!currentScore?.dqElements || currentScore.dqElements.length === 0) return 0;
    
    const elementScores = currentScore.dqElements.map(el => currentScore.dqScores?.[el] || 0);
    const average = elementScores.reduce((a, b) => a + b, 0) / elementScores.length;
    updateScore('overallScore', Math.round(average * 10) / 10);
  };

  // Export function
  const exportData = () => {
    console.log('=== EXPORT CSV DEBUG ===');
    console.log('Starting export...');
    console.log('Conversation data length:', conversationData.length);
    console.log('Scores object:', scores);
    
    try {
      if (conversationData.length === 0) {
        alert('No conversation data to export. Please load a conversation file first.');
        return;
      }

      const hasConversationId = conversationData.length > 0 && conversationData[0].conversationId;
      console.log('Has conversation ID:', hasConversationId);
      
      let csvContent = '';
      
      if (hasConversationId) {
        console.log('Using standardized format...');
        const headers = [
          'conversation_id', 'turn_number', 'speaker', 'utterance',
          'DQ_Elements', 'Utterance_Type', 'UF_Score', 'MA_Score', 'RI_Score', 
          'CVT_Score', 'SR_Score', 'CA_Score', 'Overall_Score', 'Emotional_Tone', 
          'Cognitive_State', 'Decision_Progress', 'Observed_Change', 'Change_Intensity', 
          'Rationale', 'Notes'
        ];

        csvContent = headers.join(',') + '\n';

        conversationData.forEach((utterance, index) => {
          const id = `${utterance.turn}-${utterance.speaker}`;
          const score = scores[id] || {};
          
          console.log(`Processing utterance ${index}: ${id}`, score);
          
          const row = [
            utterance.conversationId || '',
            utterance.turn || '',
            utterance.speaker ? utterance.speaker.toLowerCase() : '',
            `"${(utterance.text || '').replace(/"/g, '""')}"`,
            utterance.speaker === "Coach" ? `"${(score.dqElements || []).join('; ')}"` : '',
            utterance.speaker === "Coach" ? `"${score.utteranceType || ''}"` : '',
            utterance.speaker === "Coach" ? (score.dqScores?.UF || '') : '',
            utterance.speaker === "Coach" ? (score.dqScores?.MA || '') : '',
            utterance.speaker === "Coach" ? (score.dqScores?.RI || '') : '',
            utterance.speaker === "Coach" ? (score.dqScores?.CVT || '') : '',
            utterance.speaker === "Coach" ? (score.dqScores?.SR || '') : '',
            utterance.speaker === "Coach" ? (score.dqScores?.CA || '') : '',
            utterance.speaker === "Coach" ? (score.overallScore || '') : '',
            utterance.speaker === "Jamie" ? `"${score.emotionalTone || ''}"` : '',
            utterance.speaker === "Jamie" ? `"${score.cognitiveState || ''}"` : '',
            utterance.speaker === "Jamie" ? (score.decisionProgress ? 'Yes' : 'No') : '',
            utterance.speaker === "Jamie" ? `"${score.observedChange || ''}"` : '',
            utterance.speaker === "Jamie" ? (score.changeIntensity || '') : '',
            utterance.speaker === "Coach" ? `"${(score.rationale || '').replace(/"/g, '""')}"` : '',
            utterance.speaker === "Jamie" ? `"${(score.notes || '').replace(/"/g, '""')}"` : ''
          ];
          
          csvContent += row.join(',') + '\n';
        });

        console.log('✓ Exported in standardized format with original columns preserved');
        
      } else {
        console.log('Using legacy format...');
        const headers = [
          'Turn', 'Speaker', 'Text', 'DQ_Elements', 'Utterance_Type',
          'UF_Score', 'MA_Score', 'RI_Score', 'CVT_Score', 'SR_Score', 'CA_Score', 'Overall_Score',
          'Emotional_Tone', 'Cognitive_State', 'Decision_Progress', 'Observed_Change', 'Change_Intensity',
          'Rationale', 'Notes'
        ];

        csvContent = headers.join(',') + '\n';

        conversationData.forEach((utterance, index) => {
          const id = `${utterance.turn}-${utterance.speaker}`;
          const score = scores[id] || {};
          
          console.log(`Processing utterance ${index}: ${id}`, score);
          
          const row = [
            utterance.turn || '',
            utterance.speaker || '',
            `"${(utterance.text || '').replace(/"/g, '""')}"`,
            utterance.speaker === "Coach" ? `"${(score.dqElements || []).join('; ')}"` : '',
            utterance.speaker === "Coach" ? `"${score.utteranceType || ''}"` : '',
            utterance.speaker === "Coach" ? (score.dqScores?.UF || '') : '',
            utterance.speaker === "Coach" ? (score.dqScores?.MA || '') : '',
            utterance.speaker === "Coach" ? (score.dqScores?.RI || '') : '',
            utterance.speaker === "Coach" ? (score.dqScores?.CVT || '') : '',
            utterance.speaker === "Coach" ? (score.dqScores?.SR || '') : '',
            utterance.speaker === "Coach" ? (score.dqScores?.CA || '') : '',
            utterance.speaker === "Coach" ? (score.overallScore || '') : '',
            utterance.speaker === "Jamie" ? `"${score.emotionalTone || ''}"` : '',
            utterance.speaker === "Jamie" ? `"${score.cognitiveState || ''}"` : '',
            utterance.speaker === "Jamie" ? (score.decisionProgress ? 'Yes' : 'No') : '',
            utterance.speaker === "Jamie" ? `"${score.observedChange || ''}"` : '',
            utterance.speaker === "Jamie" ? (score.changeIntensity || '') : '',
            utterance.speaker === "Coach" ? `"${(score.rationale || '').replace(/"/g, '""')}"` : '',
            utterance.speaker === "Jamie" ? `"${(score.notes || '').replace(/"/g, '""')}"` : ''
          ];
          
          csvContent += row.join(',') + '\n';
        });

        console.log('✓ Exported in legacy format for backward compatibility');
      }

      console.log('CSV content length:', csvContent.length);
      console.log('First 200 chars:', csvContent.substring(0, 200));
      
      setCsvData(csvContent);
      setShowCSVModal(true);
      
      console.log('✓ Export completed successfully');
      
    } catch (error) {
      console.error('=== EXPORT ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      alert('Export failed: ' + error.message);
    }
  };

  const handleCopyToClipboard = async () => {
    console.log('=== COPY TO CLIPBOARD DEBUG ===');
    console.log('Starting copy...');
    console.log('CSV data length:', csvData.length);
    
    try {
      if (!csvData || csvData.trim().length === 0) {
        alert('No CSV data to copy. Please try exporting again.');
        return;
      }

      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(csvData);
        console.log('✓ Copied using modern clipboard API');
        alert('CSV data copied to clipboard! You can now paste it into Excel or Google Sheets.');
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = csvData;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          console.log('✓ Copied using fallback method');
          alert('CSV data copied to clipboard! You can now paste it into Excel or Google Sheets.');
        } else {
          throw new Error('Copy command failed');
        }
      }
    } catch (error) {
      console.error('=== COPY ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      alert('Could not copy to clipboard automatically. Please manually select and copy the text in the box below.');
    }
  };

  const handleDownloadCSV = () => {
    console.log('=== DOWNLOAD CSV DEBUG ===');
    console.log('Starting download...');
    console.log('CSV data length:', csvData.length);
    
    try {
      if (!csvData || csvData.trim().length === 0) {
        alert('No CSV data to download. Please try exporting again.');
        return;
      }

      // Simple, reliable download method
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const filename = `DQ_Scoring_Results_${new Date().toISOString().slice(0,10)}.csv`;
      
      console.log('Created blob and URL');
      
      // Create download link
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      // Add to document, click, and remove
      document.body.appendChild(link);
      console.log('Added link to document');
      
      link.click();
      console.log('Clicked link');
      
      // Clean up after a short delay
      setTimeout(() => {
        try {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          console.log('Cleanup completed');
        } catch (cleanupError) {
          console.log('Cleanup had minor issue but download should work');
        }
      }, 100);
      
      console.log('✓ Download initiated successfully');
      alert('Download started! Check your Downloads folder for: ' + filename);
      
    } catch (error) {
      console.error('=== DOWNLOAD ERROR ===');
      console.error('Error:', error);
      alert('Download failed. Please use copy/paste method instead.');
    }
  };

  const ScoreSlider = ({ element, score, onChange }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className={`px-2 py-1 rounded text-xs ${dqElements[element].color}`}>
          {dqElements[element].name}
        </span>
        <span className="font-mono text-sm">{score?.toFixed(1) || '0.0'}</span>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={score || 0}
        onChange={(e) => onChange(element, parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>0.0</span>
        <span>0.5</span>
        <span>1.0</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Decision Quality Scorer</h1>
          <p className="text-gray-600">Score coaching conversations against DQ framework</p>
          <p className="text-sm text-gray-500 mt-1">Current file: {fileName}</p>
        </div>
        <div className="flex gap-2">
          <label className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 cursor-pointer flex items-center gap-2">
            <Upload size={16} />
            Upload File
            <input
              type="file"
              accept=".csv,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <button
            onClick={() => setShowDocumentation(!showDocumentation)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <FileText size={16} />
            Guide
          </button>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-2"
          >
            <HelpCircle size={16} />
            Help
          </button>
          <button
            onClick={exportData}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Documentation Panel */}
      {showDocumentation && (
        <div className="mb-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-bold text-gray-900 mb-4 text-lg">Complete Scoring Documentation</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Decision Quality Elements</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-blue-800">Useful Framing (UF):</span>
                  <p className="text-gray-700">Helps clarify the decision scope, identifies stakeholders, challenges assumptions, reframes problems constructively.</p>
                  <p className="text-xs text-gray-600 italic">Example: "Let's step back - what exactly are you trying to decide here?"</p>
                </div>
                
                <div>
                  <span className="font-medium text-green-800">Meaningful Alternatives (MA):</span>
                  <p className="text-gray-700">Encourages exploration of diverse options, challenges either/or thinking, suggests hybrid approaches.</p>
                  <p className="text-xs text-gray-600 italic">Example: "What if there's a way to combine both paths?"</p>
                </div>
                
                <div>
                  <span className="font-medium text-yellow-800">Reliable Information (RI):</span>
                  <p className="text-gray-700">Guides information gathering, questions sources, promotes real-world exposure, warns against bias.</p>
                  <p className="text-xs text-gray-600 italic">Example: "Have you talked to people actually working in that field?"</p>
                </div>
                
                <div>
                  <span className="font-medium text-purple-800">Clear Values & Tradeoffs (CVT):</span>
                  <p className="text-gray-700">Elicits personal values, explores stakeholder alignment, addresses stability vs. passion tensions.</p>
                  <p className="text-xs text-gray-600 italic">Example: "What matters most to you in a career?"</p>
                </div>
                
                <div>
                  <span className="font-medium text-orange-800">Sound Reasoning (SR):</span>
                  <p className="text-gray-700">Identifies logical inconsistencies, challenges cognitive biases, promotes systematic thinking.</p>
                  <p className="text-xs text-gray-600 italic">Example: "I notice you're assuming X, but what evidence supports that?"</p>
                </div>
                
                <div>
                  <span className="font-medium text-red-800">Commitment to Action (CA):</span>
                  <p className="text-gray-700">Moves toward concrete next steps, addresses implementation barriers, builds accountability.</p>
                  <p className="text-xs text-gray-600 italic">Example: "What's the very next step you could take this week?"</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Scoring Guidelines</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">Scoring Scale (0.0-1.0):</span>
                  <ul className="list-disc list-inside text-gray-700 ml-2">
                    <li><strong>0.0-0.2:</strong> Absent or counterproductive</li>
                    <li><strong>0.3-0.4:</strong> Minimal presence, weak execution</li>
                    <li><strong>0.5-0.6:</strong> Adequate, some effectiveness</li>
                    <li><strong>0.7-0.8:</strong> Good execution, clear impact</li>
                    <li><strong>0.9-1.0:</strong> Excellent, sophisticated, transformative</li>
                  </ul>
                </div>
                
                <div>
                  <span className="font-medium">Best Practices:</span>
                  <ul className="list-disc list-inside text-gray-700 ml-2">
                    <li>Score conservatively - save 0.8+ for truly excellent examples</li>
                    <li>Consider context - early vs. late conversation</li>
                    <li>Look for specific behavioral indicators</li>
                    <li>Document rationale for scores ≥0.7</li>
                    <li>Flag quality issues in problematic utterances</li>
                  </ul>
                </div>
                
                <div>
                  <span className="font-medium">Jamie's Emotional Journey:</span>
                  <ul className="list-disc list-inside text-gray-700 ml-2">
                    <li><strong>Early:</strong> Often anxious, confused, vulnerable</li>
                    <li><strong>Middle:</strong> Exploring, reflective, gaining clarity</li>
                    <li><strong>Late:</strong> More confident, determined, grateful</li>
                  </ul>
                </div>
                
                <div>
                  <span className="font-medium">Common Cognitive Changes:</span>
                  <ul className="list-disc list-inside text-gray-700 ml-2">
                    <li><strong>Reframe:</strong> Shifts perspective on problem</li>
                    <li><strong>Expand:</strong> Considers broader options</li>
                    <li><strong>Clarify:</strong> Gains clearer understanding</li>
                    <li><strong>Integrate:</strong> Combines multiple viewpoints</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Panel */}
      {showHelp && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Quick Scoring Guide & CSV Format</h3>
          
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">For Coach Utterances:</h4>
              <ul className="list-disc list-inside text-blue-700 space-y-1">
                <li>Select which DQ elements are present</li>
                <li>Score each element 0.0-1.0</li>
                <li>Choose utterance type</li>
                <li>Provide brief rationale</li>
              </ul>
              
              <h4 className="font-medium text-blue-800 mb-2 mt-4">For Jamie Responses:</h4>
              <ul className="list-disc list-inside text-blue-700 space-y-1">
                <li>Select emotional tone</li>
                <li>Choose cognitive state</li>
                <li>Mark decision progress (Yes/No)</li>
                <li>Note any observed changes</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-800 mb-2">File Upload Formats:</h4>
              
              <div className="bg-white p-3 rounded border mb-3">
                <p className="font-medium text-gray-800 mb-1">✅ NEW Standardized CSV Format (Required):</p>
                <div className="font-mono text-xs bg-gray-100 p-2 rounded">
                  conversation_id,turn_number,speaker,utterance<br/>
                  p4,1,coach,"Hi Jamie, I'm your decision coach..."<br/>
                  p4,2,jamie,"Thanks, I need help with a decision..."<br/>
                  p4,3,coach,"Tell me more about that..."<br/>
                  p4,4,jamie,"Well, it's about my career..."
                </div>
                <div className="text-xs text-green-700 mt-1 space-y-1">
                  <p><strong>Required:</strong> Exact column names (case-sensitive)</p>
                  <p><strong>conversation_id:</strong> Unique identifier (e.g., "p4", "session_1")</p>
                  <p><strong>turn_number:</strong> Sequential integers (1, 2, 3...)</p>
                  <p><strong>speaker:</strong> Exactly "coach" or "jamie" (lowercase)</p>
                  <p><strong>utterance:</strong> Full text, no empty cells</p>
                </div>
              </div>
              
              <div className="bg-white p-3 rounded border mb-3">
                <p className="font-medium text-gray-800 mb-1">⚠️ Legacy CSV Formats (Deprecated):</p>
                <div className="font-mono text-xs bg-gray-100 p-2 rounded mb-1">
                  Turn,Coach_Text,Jamie_Text<br/>
                  Turn,Speaker,Text
                </div>
                <p className="text-xs text-orange-700">
                  <strong>Action Required:</strong> Use the "unpivot" script to convert to new format
                </p>
              </div>
              
              <div className="bg-white p-3 rounded border">
                <p className="font-medium text-gray-800 mb-1">📄 Word Document Format (.docx) - Legacy Support:</p>
                <div className="font-mono text-xs bg-gray-100 p-2 rounded mb-2">
                  Jamie: Hi there. I'm Jamie...<br/>
                  Coach: Hi Jamie, I'm your decision coach...<br/>
                  Jamie: Thanks, I need help...<br/>
                  Coach: Tell me more about that...
                </div>
                <p className="text-xs text-blue-600">
                  <strong>Note:</strong> Word format maintained for backward compatibility. 
                  New standardized CSV format recommended for best results.
                </p>
              </div>
              
              <p className="text-xs text-blue-600 mt-2">
                <strong>Validation Rules:</strong>
              </p>
              <ul className="text-xs text-blue-600 list-disc list-inside mt-1 space-y-1">
                <li>Headers must match exactly (case-sensitive)</li>
                <li>Turn numbers must increment by 1 within each conversation</li>
                <li>Speaker must be exactly "coach" or "jamie"</li>
                <li>No empty utterances allowed</li>
                <li>UTF-8 encoding required</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Conversation Panel */}
        <div className="lg:col-span-2">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Turn {currentUtterance?.turn} - {currentUtterance?.speaker}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {currentIndex + 1} of {conversationData.length}
                </span>
                {scores[utteranceId] && Object.keys(scores[utteranceId]).some(key => scores[utteranceId][key]) && (
                  <CheckCircle size={16} className="text-green-600" />
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 mb-4">
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 ${
                isCoach ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
              }`}>
                {currentUtterance?.speaker}
              </div>
              
              {/* Quality Issues Warning */}
              {hasQualityIssues && (
                <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded flex items-start gap-2">
                  <AlertTriangle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-yellow-800 font-medium text-sm">Quality Issues Detected:</p>
                    <ul className="text-yellow-700 text-xs list-disc list-inside">
                      {hasQualityIssues.map((issue, i) => (
                        <li key={i}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              <p className="text-gray-800 leading-relaxed">
                {currentUtterance?.text}
              </p>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <button
                onClick={() => setCurrentIndex(Math.min(conversationData.length - 1, currentIndex + 1))}
                disabled={currentIndex === conversationData.length - 1}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Scoring Panel */}
        <div className="space-y-6">
          {isCoach ? (
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Coach Scoring</h3>
              
              {/* DQ Elements Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  DQ Elements Present
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(dqElements).map(([key, element]) => (
                    <button
                      key={key}
                      onClick={() => toggleDQElement(key)}
                      className={`p-2 rounded text-xs font-medium transition-all ${
                        scores[utteranceId]?.dqElements?.includes(key)
                          ? element.color
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {element.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* DQ Scores */}
              {scores[utteranceId]?.dqElements?.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Element Scores
                  </label>
                  <div className="space-y-4">
                    {scores[utteranceId].dqElements.map(element => (
                      <ScoreSlider
                        key={element}
                        element={element}
                        score={scores[utteranceId]?.dqScores?.[element]}
                        onChange={updateDQScore}
                      />
                    ))}
                  </div>
                  <button
                    onClick={calculateOverallScore}
                    className="mt-3 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                  >
                    Calculate Overall Score: {scores[utteranceId]?.overallScore?.toFixed(1) || '0.0'}
                  </button>
                </div>
              )}

              {/* Utterance Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Utterance Type
                </label>
                <select
                  value={scores[utteranceId]?.utteranceType || ''}
                  onChange={(e) => updateScore('utteranceType', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select type...</option>
                  {utteranceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Rationale */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scoring Rationale
                </label>
                <textarea
                  value={scores[utteranceId]?.rationale || ''}
                  onChange={(e) => updateScore('rationale', e.target.value)}
                  placeholder="Brief explanation of scoring decisions..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Jamie Scoring</h3>
              
              {/* Emotional Tone */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emotional Tone
                </label>
                <select
                  value={scores[utteranceId]?.emotionalTone || ''}
                  onChange={(e) => updateScore('emotionalTone', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select tone...</option>
                  {emotionalTones.map(tone => (
                    <option key={tone} value={tone}>{tone}</option>
                  ))}
                </select>
              </div>

              {/* Cognitive State */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cognitive State
                </label>
                <select
                  value={scores[utteranceId]?.cognitiveState || ''}
                  onChange={(e) => updateScore('cognitiveState', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select state...</option>
                  {cognitiveStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              {/* Decision Progress */}
              <div className="mb-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={scores[utteranceId]?.decisionProgress || false}
                    onChange={(e) => updateScore('decisionProgress', e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Shows Decision Progress</span>
                </label>
              </div>

              {/* Observed Change */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observed Change
                </label>
                <select
                  value={scores[utteranceId]?.observedChange || ''}
                  onChange={(e) => updateScore('observedChange', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select change...</option>
                  {observedChanges.map(change => (
                    <option key={change} value={change}>{change}</option>
                  ))}
                </select>
              </div>

              {/* Change Intensity */}
              {scores[utteranceId]?.observedChange && scores[utteranceId]?.observedChange !== 'None' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Change Intensity: {scores[utteranceId]?.changeIntensity || 3}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={scores[utteranceId]?.changeIntensity || 3}
                    onChange={(e) => updateScore('changeIntensity', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Subtle</span>
                    <span>Moderate</span>
                    <span>Strong</span>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={scores[utteranceId]?.notes || ''}
                  onChange={(e) => updateScore('notes', e.target.value)}
                  placeholder="Additional observations..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSV Export Modal */}
      {showCSVModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <h3 className="text-lg font-semibold mb-4">CSV Export Data</h3>
            
            <div className="mb-4 flex gap-2">
              <button
                onClick={handleCopyToClipboard}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={handleDownloadCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Download CSV
              </button>
              <button
                onClick={() => setShowCSVModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
            
            <div className="mb-3">
              <p className="text-sm text-gray-600">
                <strong>Instructions:</strong> Copy the data below and paste into Excel, Google Sheets, or save as a .csv file
              </p>
            </div>
            
            <textarea
              value={csvData}
              readOnly
              className="w-full h-96 p-3 border border-gray-300 rounded-lg font-mono text-xs bg-gray-50"
              onClick={(e) => e.target.select()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DQScoringInterface;