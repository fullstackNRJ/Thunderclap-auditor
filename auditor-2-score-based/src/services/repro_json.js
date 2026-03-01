
function extractJSON(text) {
    // 1. Remove markdown code blocks
    let cleaned = text.replace(/```json\n?|```/g, "").trim();

    // 2. Find the first '{' or '[' and the last corresponding '}' or ']'
    const startBrace = cleaned.indexOf("{");
    const startBracket = cleaned.indexOf("[");
    let startIndex = -1;

    if (startBrace !== -1 && (startBracket === -1 || startBrace < startBracket)) {
        startIndex = startBrace;
    } else if (startBracket !== -1) {
        startIndex = startBracket;
    }

    if (startIndex === -1) return cleaned;

    const endBrace = cleaned.lastIndexOf("}");
    const endBracket = cleaned.lastIndexOf("]");
    let endIndex = -1;

    if (endBrace !== -1 && (endBracket === -1 || endBrace > endBracket)) {
        endIndex = endBrace;
    } else if (endBracket !== -1) {
        endIndex = endBracket;
    }

    if (endIndex === -1) return cleaned;

    cleaned = cleaned.substring(startIndex, endIndex + 1);

    // 3. Sanitize the extracted JSON
    return sanitizeJSON(cleaned);
}

function sanitizeJSON(json) {
    return json
        // Remove trailing commas in objects and arrays
        .replace(/,\s*([}\]])/g, "$1")
        // Fix unescaped newlines in strings
        .replace(/"([^"]*)"/g, (match, p1) => {
            return '"' + p1.replace(/\n/g, "\\n").replace(/\r/g, "\\r") + '"';
        });
}

function test(label, input) {
    process.stdout.write(`--- Test: ${label} --- `);
    const extracted = extractJSON(input);
    try {
        const parsed = JSON.parse(extracted);
        console.log("SUCCESS");
    } catch (e) {
        console.log(`FAILURE: ${e.message}`);
        console.log(`Input: ${input.substring(0, 50)}...`);
        console.log(`Extracted: "${extracted}"`);
    }
}

// 1. Basic JSON
test("Basic JSON", '{"key": "value"}');

// 2. JSON with markdown blocks
test("Markdown JSON", 'Here is the result: ```json\n{"key": "value"}\n``` Hope that helps.');

// 3. Trailing comma
test("Trailing Comma", '{"a": 1, "b": 2,}');

// 4. Newlines in string
test("Newlines in string", '{"text": "Line 1\nLine 2"}');

// 5. Multiple JSON blocks (should take outermost)
test("Multiple blocks", 'Text before {"a": 1} text after {"b": 2}');

// 6. JSON with code block and text
test("Markdown + Text", 'OK here it is: ```json\n{\n  "status": "ok",\n  "data": [1, 2, 3,]\n}\n```');
