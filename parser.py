
import json

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

with open('all_wastes.json', 'r') as f:
    wastes = json.load(f)

new_waste_list = []
for item in wastes:
    waste_type = get_waste_type_from_disposal_info(item['disposal_info'])
    name = item['name'].replace("'", "\\'")
    new_waste_list.append(
        f"  {{ type: '{waste_type}', en: '{name}', nl: '{name}', zh: '' }},"
    )

with open('constants.ts', 'r') as f:
    constants_content = f.read()

start_marker = "// Massively expanded list based on afvalscheidingswijzer.nl"
end_marker = "];"
start_index = constants_content.find(start_marker)
end_index = constants_content.find(end_marker, start_index)

if start_index != -1 and end_index != -1:
    new_constants_content = (
        constants_content[:start_index] +
        start_marker +
        "\nconst wasteList: SearchableWasteItem[] = [\n" +
        "\n".join(new_waste_list) +
        "\n" +
        constants_content[end_index:]
    )

    with open('constants.ts', 'w') as f:
        f.write(new_constants_content)
    print("Successfully updated constants.ts")
else:
    print("Could not find the waste list in constants.ts")
