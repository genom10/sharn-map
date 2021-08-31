"""Make boilerplate JSON file for descriptions."""
from pprint import pprint
import json
from pathlib import Path

json_file = Path("districtInfo.json")

district_nums = {"M": 5, "C": 6, "T": 6, "N": 3, "D": 8}
cliffside_districts = {
    "grayflood": "Grayflood",
    "sharnsWelcome": "Sharn's Welcome",
    "mudCaves": "Mud Caves",
    "shipsTowers": "Ship's Towers",
}

district_dict = {}
for district_prefix, num_entries in district_nums.items():
    for i in range(1, num_entries + 1):
        district_id = f"{district_prefix}{i}"
        boilerplate_district = {
            "name": "",
            "description": "",
            "notableLocations": {"name": [], "description": []},
        }
        district_dict[district_id] = {
            "upper": boilerplate_district,
            "middle": boilerplate_district,
            "lower": boilerplate_district,
        }

for district_id, readable_name in cliffside_districts.items():
    district_dict[district_id] = {"name": readable_name, "description": ""}

if not json_file.exists():
    json_file.write_text(json.dumps(district_dict))
