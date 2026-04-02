import csv
import json
import re
from datetime import datetime


def parse_csv_to_json(csv_file, output_file):
    calls = []

    with open(csv_file, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        rows = list(reader)

        # Skip header row
        for i, row in enumerate(rows):
            if i == 0:
                continue

            if len(row) < 15:
                continue

            call_id = row[0].strip() if row[0] else ""
            assistant_id = row[1].strip() if len(row) > 1 else ""
            squad_id = row[2].strip() if len(row) > 2 else ""
            customer_id = row[3].strip() if len(row) > 3 else ""
            customer_name = row[4].strip() if len(row) > 4 else ""
            customer_number = row[5].strip() if len(row) > 5 else ""
            customer_sip_uri = row[6].strip() if len(row) > 6 else ""
            customer_extension = row[7].strip() if len(row) > 7 else ""
            phone_number_id = row[8].strip() if len(row) > 8 else ""
            ended_reason = row[9].strip() if len(row) > 9 else ""
            call_type = row[10].strip() if len(row) > 10 else ""
            duration = row[11].strip() if len(row) > 11 else "0"
            started_at = row[12].strip() if len(row) > 12 else ""
            ended_at = row[13].strip() if len(row) > 13 else ""
            transcript = row[14].strip() if len(row) > 14 else ""
            summary = row[15].strip() if len(row) > 15 else ""
            success_evaluation = row[16].strip() if len(row) > 16 else ""
            recording_url = row[17].strip() if len(row) > 17 else ""
            cost = row[18].strip() if len(row) > 18 else ""
            phone_provider = row[19].strip() if len(row) > 19 else ""
            phone_provider_id = row[20].strip() if len(row) > 20 else ""
            created_at = row[21].strip() if len(row) > 21 else ""
            updated_at = row[22].strip() if len(row) > 22 else ""
            call_summary = row[23].strip() if len(row) > 23 else ""

            # Parse transcript into structured messages
            messages = []
            if transcript:
                # Split by "AI:" and "User:" markers
                parts = re.split(r"(?=AI: |User: )", transcript)
                for part in parts:
                    if not part.strip():
                        continue
                    if part.startswith("AI:"):
                        messages.append({"speaker": "AI", "text": part[3:].strip()})
                    elif part.startswith("User:"):
                        messages.append({"speaker": "User", "text": part[5:].strip()})

            # Determine language used
            languages = []
            if any(
                word in transcript.lower()
                for word in [
                    "goedendag",
                    "dag",
                    "welkom",
                    "hoe",
                    "wat",
                    "kunt",
                    "bedankt",
                ]
            ):
                languages.append("Dutch")
            if any(
                word in transcript.lower()
                for word in ["bonjour", "merci", "vous", "parlez", "bien"]
            ):
                languages.append("French")
            if any(
                word in transcript.lower()
                for word in ["hello", "good day", "thank", "please", "help"]
            ):
                languages.append("English")
            if any(char in transcript for char in ["नमस्ते", "मैं", "आप", "क्या"]):
                languages.append("Hindi")
            if any(char in transcript for char in ["क्या", "है", "में", "को"]):
                languages.append("Hindi")
            if any(char in transcript for char in ["こんにちは", "ありがとう", "日本"]):
                languages.append("Japanese")

            # Clean duration
            try:
                duration_seconds = int(duration)
            except:
                duration_seconds = 0

            # Determine call outcome
            if ended_reason == "customer-ended-call":
                outcome = "customer_ended"
            elif ended_reason == "assistant-ended-call":
                outcome = "assistant_ended"
            else:
                outcome = ended_reason

            call_obj = {
                "call_id": call_id,
                "assistant_id": assistant_id,
                "customer": {
                    "name": customer_name if customer_name else None,
                    "number": customer_number if customer_number else None,
                    "sip_uri": customer_sip_uri if customer_sip_uri else None,
                    "extension": customer_extension if customer_extension else None,
                },
                "phone_number_id": phone_number_id if phone_number_id else None,
                "call_info": {
                    "type": call_type,
                    "duration_seconds": duration_seconds,
                    "started_at": started_at,
                    "ended_at": ended_at,
                    "ended_reason": ended_reason,
                    "outcome": outcome,
                    "provider": phone_provider if phone_provider else None,
                    "provider_id": phone_provider_id if phone_provider_id else None,
                    "cost_usd": float(cost)
                    if cost and cost.replace(".", "").isdigit()
                    else None,
                    "recording_url": recording_url if recording_url else None,
                },
                "transcript": {"messages": messages, "full_text": transcript},
                "analysis": {
                    "languages_used": languages,
                    "summary": summary if summary else call_summary,
                    "success": True if success_evaluation.lower() == "true" else False,
                },
            }

            calls.append(call_obj)

    # Create knowledge base structure
    knowledge_base = {
        "metadata": {
            "total_calls": len(calls),
            "generated_at": datetime.now().isoformat(),
            "source": "VAPI Call Export",
            "purpose": "AI Agent Training - Call Intonation & Response Patterns",
        },
        "statistics": {
            "total_duration_seconds": sum(
                c["call_info"]["duration_seconds"] for c in calls
            ),
            "successful_calls": sum(1 for c in calls if c["analysis"]["success"]),
            "customer_ended": sum(
                1 for c in calls if c["call_info"]["outcome"] == "customer_ended"
            ),
            "inbound_calls": sum(
                1 for c in calls if c["call_info"]["type"] == "inboundPhoneCall"
            ),
            "web_calls": sum(1 for c in calls if c["call_info"]["type"] == "webCall"),
        },
        "language_usage": {},
        "call_patterns": [],
        "examples": {
            "good_opening_greetings": [],
            "multilingual_handling": [],
            "handling_difficult_customers": [],
            "successful_property_queries": [],
            "failed_or_ended_calls": [],
        },
        "calls": calls,
    }

    # Analyze language usage
    lang_counts = {}
    for call in calls:
        for lang in call["analysis"]["languages_used"]:
            lang_counts[lang] = lang_counts.get(lang, 0) + 1
    knowledge_base["statistics"]["language_usage"] = lang_counts

    # Extract examples
    for call in calls:
        transcript_text = call["transcript"]["full_text"].lower()

        # Good opening greetings
        if any(
            word in transcript_text
            for word in [
                "good day",
                "good morning",
                "goedendag",
                "bonjour",
                "hallo",
                "hi there",
            ]
        ):
            if call["call_info"]["duration_seconds"] > 20:
                knowledge_base["examples"]["good_opening_greetings"].append(
                    {
                        "call_id": call["call_id"],
                        "duration": call["call_info"]["duration_seconds"],
                        "transcript": call["transcript"]["full_text"][:500],
                    }
                )

        # Multilingual handling
        if len(call["analysis"]["languages_used"]) > 1:
            knowledge_base["examples"]["multilingual_handling"].append(
                {
                    "call_id": call["call_id"],
                    "languages": call["analysis"]["languages_used"],
                    "transcript": call["transcript"]["full_text"][:500],
                }
            )

        # Handling difficult customers
        if any(
            word in transcript_text
            for word in ["frustrat", "sorry", "apolog", "mistake", "forgive"]
        ):
            knowledge_base["examples"]["handling_difficult_customers"].append(
                {
                    "call_id": call["call_id"],
                    "duration": call["call_info"]["duration_seconds"],
                    "transcript": call["transcript"]["full_text"][:500],
                }
            )

        # Property queries
        if any(
            word in transcript_text
            for word in [
                "apartment",
                "house",
                "rent",
                "buy",
                "property",
                "woning",
                "huis",
                "appartement",
            ]
        ):
            knowledge_base["examples"]["successful_property_queries"].append(
                {
                    "call_id": call["call_id"],
                    "duration": call["call_info"]["duration_seconds"],
                    "transcript": call["transcript"]["full_text"][:500],
                }
            )

        # Failed/short calls
        if call["call_info"]["duration_seconds"] < 15:
            knowledge_base["examples"]["failed_or_ended_calls"].append(
                {
                    "call_id": call["call_id"],
                    "duration": call["call_info"]["duration_seconds"],
                    "reason": call["call_info"]["ended_reason"],
                    "transcript": call["transcript"]["full_text"][:500],
                }
            )

    # Write to output file
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(knowledge_base, f, indent=2, ensure_ascii=False)

    print(f"Successfully converted {len(calls)} calls to {output_file}")
    print(
        f"Total duration: {knowledge_base['statistics']['total_duration_seconds']} seconds"
    )
    print(f"Language usage: {lang_counts}")


if __name__ == "__main__":
    csv_file = "/Users/eburon/Downloads/calls-export-2e688723-0054-43c7-bcbb-0391c96b87c4-2026-04-02-04-08-39.csv"
    output_file = "/Users/eburon/Desktop/tts-app/echo/calls-knowledge-base.json"
    parse_csv_to_json(csv_file, output_file)
