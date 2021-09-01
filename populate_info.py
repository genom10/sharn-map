"""Make boilerplate JSON file for descriptions."""
import json
from pathlib import Path

JSON_FILE = Path("districtInfoEmpty.json")

district_nums = {"M": 5, "C": 6, "T": 6, "N": 3, "D": 8}
cliffside_districts = {
    "grayflood": "Grayflood",
    "sharnsWelcome": "Sharn's Welcome",
    "mudCaves": "Mud Caves",
    "shipsTowers": "Ship's Towers",
}
boilerplate_district = {
    "name": "",
    "description": "",
    "notableLocations": {"name": [], "description": []},
}
wards = {
    "cliffside": "Cliffside",
    "tavicks": "Tavick's Landing",
    "menthis": "Menthis Plateau",
    "central": "Central Plateau",
    "dura": "Dura",
    "northedge": "Northedge",
}

district_dict = {}
for district_prefix, num_entries in district_nums.items():
    for i in range(1, num_entries + 1):
        district_id = f"{district_prefix}{i}"
        district_dict[district_id] = {
            "upper": boilerplate_district,
            "middle": boilerplate_district,
            "lower": boilerplate_district,
        }

for district_id, readable_name in cliffside_districts.items():
    # Copy the boilerplate
    cliffside_district = dict(**boilerplate_district)
    cliffside_district["name"] = readable_name
    district_dict[district_id] = cliffside_district

for ward_id, ward_name in wards.items():
    district_dict[ward_id] = {"name": ward_name, "description": ""}

JSON_FILE.write_text(json.dumps(district_dict, indent=4, sort_keys=True))
