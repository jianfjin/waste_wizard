
import json
import time
import os
import google.generativeai as genai

# --- Configuration ---
# Make sure to set the GEMINI_API_KEY environment variable
API_KEY = os.environ.get("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable not set. Please set it to your API key.")

genai.configure(api_key=API_KEY)
# Use the gemini-1.5-flash model for faster translations
model = genai.GenerativeModel('gemini-1.5-flash')
# --- End Configuration ---

def get_waste_type_from_disposal_info(disposal_info):
    if not disposal_info:
        return "rest"
    disposal_info = disposal_info.lower()
    if "pmd" in disposal_info:
        return "pmd"
    if "gft" in disposal_info:
        return "gft"
    if "restafval" in disposal_info:
        return "rest"
    if "papierbak" in disposal_info or "papier" in disposal_info:
        return "papier"
    if "glasbak" in disposal_info:
        return "glas"
    if "chemisch afval" in disposal_info or "kca" in disposal_info:
        return "kca"
    if "textielbak" in disposal_info or "textiel" in disposal_info:
        return "textiel"
    if "elektrisch" in disposal_info or "e-waste" in disposal_info:
        return "e-waste"
    if "grofvuil" in disposal_info or "milieustraat" in disposal_info:
        return "grofvuil"
    return "rest"

def translate(text, target_language):
    """Translates text to the target language using the Gemini API."""
    if not text:
        return ""
    print(f"Translating '{text}' to {target_language}...")
    try:
        # Construct a prompt that is very specific about the desired output format.
        prompt = f"Translate the following Dutch text to {target_language}. Respond with ONLY the translated text, no other formatting, notes, or quotation marks. The Dutch text is: '{text}'"
        response = model.generate_content(prompt)
        # Add a delay to avoid hitting API rate limits
        time.sleep(1) # Using flash model, so a shorter delay should be fine.
        # .strip() to remove leading/trailing whitespace, and escape any single quotes in the result.
        translated_text = response.text.strip().replace("'", "\\'")
        print(f"  -> Translation: {translated_text}")
        return translated_text
    except Exception as e:
        print(f"An error occurred during translation: {e}")
        # Fallback to the original text if translation fails, ensuring it's also escaped.
        return text.replace("'", "\\'")

with open('all_wastes.json', 'r') as f:
    wastes = json.load(f)

new_waste_list = []
for item in wastes:
    waste_type = get_waste_type_from_disposal_info(item['disposal_info'])
    nl_name = item['name']
    
    # Translate the Dutch name to English and Chinese.
    # The translate function already handles escaping single quotes.
    en_name = translate(nl_name, 'English')
    zh_name = translate(nl_name, 'Chinese')

    # The Dutch name also needs to be escaped for the TypeScript file.
    nl_name_escaped = nl_name.replace("'", "\\'")

    disposal_info = item['disposal_info']
    if disposal_info:
        # For the disposal_info, we need to escape single quotes and newlines
        # to create a valid, multi-line TypeScript string.
        disposal_info_escaped = disposal_info.replace("'", "\\'").replace("\n", "\\n")
        disposal_info_str = f"'{disposal_info_escaped}'"
    else:
        disposal_info_str = 'null'


    new_waste_list.append(
        f"  {{ type: '{waste_type}', en: '{en_name}', nl: '{nl_name_escaped}', zh: '{zh_name}', disposal_info: {disposal_info_str} }},"
    )

with open('constants.ts', 'r') as f:
    constants_content = f.read()

start_marker = "// Massively expanded list based on afvalscheidingswijzer.nl"
end_marker = "];"
start_index = constants_content.find(start_marker)
end_index = constants_content.find(end_marker, start_index)

if start_index != -1 and end_index != -1:
    # Build the new content for the constants.ts file
    new_constants_content = (
        constants_content[:start_index] +
        start_marker +
        "\nconst wasteList: SearchableWasteItem[] = [\n" +
        "\n".join(new_waste_list) +
        "\n" +
        constants_content[end_index:]
    )

    # Write the updated content back to the file
    with open('constants.ts', 'w') as f:
        f.write(new_constants_content)
    print("Successfully updated constants.ts with translations and disposal_info")
else:
    print("Error: Could not find the target location in constants.ts to insert the waste list.")
