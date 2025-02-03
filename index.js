import * as cheerio from 'cheerio';
import fs from 'fs';

const lunch_menu_url = 'https://www.theoaksacademy.org/lunch-menu/';
const $ = await cheerio.fromURL(lunch_menu_url);

const $script = $('script.df-shortcode-script');
const script_text = $script.html();

const start_index = script_text.indexOf(' = ') + 3;
const end_index = script_text.indexOf('; ', start_index);
const json_text = script_text.slice(start_index, end_index);
const parsed_json = JSON.parse(json_text);

fetch(parsed_json.source)
  .then((response) => response.blob())
  .then((blob) => {
    const reader = blob.stream().getReader();
    const writer = fs.createWriteStream('menu.pdf');

    reader.read().then(function processText({ done, value }) {
      if (done) {
        console.log('File downloaded');
        return;
      }

      writer.write(Buffer.from(value));

      return reader.read().then(processText);
    });
  });
