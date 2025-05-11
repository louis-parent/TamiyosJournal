use std::fs::{remove_file, File};
use std::io::{self, copy, BufRead, BufReader, Write};
use std::time::Duration;

use reqwest::blocking::Client;
use reqwest::header::{ACCEPT, USER_AGENT};
use serde::{Deserialize, Serialize};
use serde_json::Value;

const HEADER: &str = "TamiyosHelper/1.0";

fn main() {
    let file_path = "bulk_data.json".to_string();
    download_bulk_file(get_url(), &file_path);
    let cards = read_json_file(&file_path);
    let _ = remove_file(file_path);

    let json = serde_json::to_string(&cards).unwrap();
    let mut file = File::create("all_cards.json").unwrap();
    file.write_all(json.as_bytes()).unwrap();
}

fn get_url() -> String {
    let url = "https://api.scryfall.com/bulk-data";

    let client = Client::new();

    let response = client
        .get(url)
        .header(USER_AGENT, HEADER)
        .header(ACCEPT, "application/json")
        .send()
        .unwrap()
        .json::<Value>()
        .unwrap();

    let bulk_data_array = response["data"].as_array().unwrap();

    for bulk_data in bulk_data_array {
        if bulk_data["type"].as_str().unwrap() == "all_cards" {
            return bulk_data["download_uri"].as_str().unwrap().to_string();
        }
    }

    "".to_string()
}

fn download_bulk_file(url: String, file_path: &String) {
    let client = Client::builder()
        .timeout(Duration::from_secs(3600))
        .build()
        .unwrap();
    let response = client.get(url).header(USER_AGENT, HEADER).send().unwrap();

    let mut file = File::create(&file_path).unwrap();
    let mut content = io::Cursor::new(response.bytes().unwrap());
    copy(&mut content, &mut file).unwrap();

    println!("File downloaded: {}", file_path);
}

fn read_json_file(file_path: &str) -> Vec<Card> {
    let file = File::open(file_path).unwrap();
    let reader = BufReader::new(file);

    println!("Reading JSON file: {}", file_path);

    let mut all_cards: Vec<Card> = Vec::new();

    for line in reader.lines() {
        let mut line = line.unwrap();

        if line.ends_with(',') {
            line.pop();
        }

        if line != "[" && line != "]" {
            let json_value: Value = serde_json::from_str(&line).unwrap();
            let name = json_value["name"].as_str().unwrap();
            all_cards.push(Card {
                n: json_value["printed_name"]
                    .as_str()
                    .unwrap_or_else(|| match json_value["card_faces"].as_array() {
                        Some(array) => match array[0].as_object() {
                            Some(object) => match &object.get("printed_name") {
                                Some(printed_name) => printed_name.as_str().unwrap_or(name),
                                None => name,
                            },
                            None => name,
                        },
                        None => name,
                    })
                    .to_string(),
                l: json_value["lang"].as_str().unwrap().to_string(),
                c: json_value["collector_number"].as_str().unwrap().to_string(),
                s: json_value["set"].as_str().unwrap().to_string(),
            });
        }
    }

    all_cards
}

#[derive(Debug, Serialize, Deserialize)]
struct Card {
    pub n: String,
    pub l: String,
    pub c: String,
    pub s: String,
}
