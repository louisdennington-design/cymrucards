from flask import Flask, render_template, jsonify, session, request
import json
import random
import os

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "your-secret-key-change-in-production")

# Must match the <option value="..."> values in index.html
ALLOWED_TYPES = {
    "verb_infinitives",
    "present_tense_conjugations",
    "compound_past_tense_conjugations",
    "preterite_conjugations",
    "nouns",
    "adjectives",
    "time_expressions",
    "whole_phrases",
}


def load_vocabulary():
    """
    Expected format (recommended):
      {
        "words": [
          {"type": "nouns", "english": "...", "welsh": "..."},
          ...
        ]
      }

    Backwards-compatible with older data.json that lacks "type"
    (those entries will be treated as type="whole_phrases").
    """
    try:
        with open("data.json", "r", encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        data = {
            "words": [
                {"type": "whole_phrases", "english": "hello", "welsh": "helo"},
                {"type": "whole_phrases", "english": "goodbye", "welsh": "hwyl fawr"},
                {"type": "whole_phrases", "english": "thank you", "welsh": "diolch"},
                {"type": "nouns", "english": "water", "welsh": "dŵr"},
                {"type": "nouns", "english": "food", "welsh": "bwyd"},
            ]
        }

    words = data.get("words", [])
    for w in words:
        if "type" not in w:
            w["type"] = "whole_phrases"
    data["words"] = words
    return data


@app.route("/")
def index():
    return render_template("index.html")


def _get_requested_type():
    t = request.args.get("type", "").strip()
    if t in ALLOWED_TYPES:
        return t
    return "nouns"


def _ensure_presented_by_type():
    if "presented_by_type" not in session or not isinstance(session["presented_by_type"], dict):
        session["presented_by_type"] = {}
    return session["presented_by_type"]


@app.route("/api/word")
def get_word():
    vocabulary = load_vocabulary()
    words = vocabulary.get("words", [])

    requested_type = _get_requested_type()

    # keep GLOBAL indices so session tracking stays stable
    typed_indices = [i for i, w in enumerate(words) if w.get("type") == requested_type]
    if not typed_indices:
        return jsonify(
            {
                "error": "No items available for this type",
                "type": requested_type,
                "english": "",
                "welsh": "",
                "total": 0,
                "seen": 0,
            }
        ), 404

    presented_by_type = _ensure_presented_by_type()
    if requested_type not in presented_by_type or not isinstance(presented_by_type[requested_type], list):
        presented_by_type[requested_type] = []

    seen_set = set(presented_by_type[requested_type])

    # If exhausted, reset just that type
    if len(seen_set) >= len(typed_indices):
        presented_by_type[requested_type] = []
        seen_set = set()

    available_indices = [i for i in typed_indices if i not in seen_set]
    if not available_indices:
        return jsonify(
            {
                "error": "No items available",
                "type": requested_type,
                "english": "",
                "welsh": "",
                "total": len(typed_indices),
                "seen": len(presented_by_type[requested_type]),
            }
        ), 404

    selected_global_index = random.choice(available_indices)
    selected_item = words[selected_global_index]

    presented_by_type[requested_type].append(selected_global_index)
    session["presented_by_type"] = presented_by_type
    session.modified = True

    total_in_type = len(typed_indices)
    seen_count = len(presented_by_type[requested_type])

    return jsonify(
        {
            "type": requested_type,
            "english": selected_item.get("english", ""),
            "welsh": selected_item.get("welsh", ""),
            # NEW: required for 10% progress UI
            "total": total_in_type,
            "seen": seen_count,
        }
    )


@app.route("/api/reset-session", methods=["POST"])
def reset_session_api():
    """
    Resets everything by default.
    Optional: reset one type only by passing ?type=...
    """
    t = request.args.get("type", "").strip()
    if t in ALLOWED_TYPES:
        presented_by_type = session.get("presented_by_type", {})
        if isinstance(presented_by_type, dict):
            presented_by_type[t] = []
            session["presented_by_type"] = presented_by_type
        else:
            session["presented_by_type"] = {t: []}
    else:
        session["presented_by_type"] = {}

    session.modified = True
    return jsonify({"message": "Session reset successfully"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
