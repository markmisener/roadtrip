"""Starts the Flask app."""
import json
import os
from pathlib import Path
from typing import Optional

from flask import Flask
from flask import render_template

app = Flask(__name__)
MAPBOX_ACCESS_TOKEN = os.environ.get("MAPBOX_ACCESS_TOKEN", None)


def get_file_contents(filename: str) -> Optional[str]:
    """Get the contents of a file.

    Args:
        filename: path to file.

    Return:
        Optional[str]: file contents

    """
    try:
        return open(filename, "r").read()
    except FileNotFoundError:
        return None


@app.route("/")
def display():
    """Displays the homepage."""
    data = json.load(open("static/data/pointData.json"))
    for feature in data["features"]:
        city = feature["properties"]["city"]
        feature["properties"]["images"] = list()
        feature["properties"]["captions"] = list()

        n_images = len([x for x in Path(f"static/data/cities/{city}").glob("*.jpg")])
        for i in range(n_images):
            feature["properties"]["images"].append(f"static/data/cities/{city}/{i}.jpg")
            fname = f"static/data/cities/{city}/{i}.txt"
            feature["properties"]["captions"].append(get_file_contents(fname))

    return render_template(
        "index.html", MAPBOX_ACCESS_TOKEN=MAPBOX_ACCESS_TOKEN, data=data
    )


if __name__ == "__main__":
    app.run(debug=True, port=4000)
