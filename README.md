# Payments Sheriff Logs Chrome Extension :smile:

![Extension Icon](icon.png)

## Overview

The "Payments Sheriff Logs" Chrome extension is a handy tool designed to simplify the task of monitoring AWS logs during sheriffing, particularly when dealing with requests and errors. It helps identify potential issues by highlighting errors in AWS logs when there is a significant time gap (greater than 15 seconds) between requests. Additionally, it provides an easier way to spot payment attempts in checkout by highlighting the "startPaymentGateway_INITRequest" in bold.

## Installation

Follow these simple steps to install the extension:

1. Download the extension files from [GitHub](https://github.com/your-username/payments-sheriff-logs).
2. Unzip the downloaded file to a location of your choice.
3. Open Google Chrome web browser.
4. Type `chrome://extensions` in the address bar and press Enter.
5. Enable "Developer mode" using the toggle switch on the top right corner of the page.
6. Click on the "Load unpacked" button and select the folder where you unzipped the extension files.
7. The "Payments Sheriff Logs" extension should now be added to your Chrome browser.

## How it Works

### Identifying Time Gaps and Errors

While reviewing AWS logs, the extension scans for gaps in time between requests. If it detects a time gap of more than 15 seconds, it highlights the log entry, making it easier for you to spot potential issues quickly.

### Highlighting Errors

The extension also highlights error entries in red, saving you the trouble of manually searching for errors in the logs. This feature provides a visual cue, allowing you to navigate directly to the problematic spot without wasting time.

### Spotting Payment Attempts

In checkout scenarios, the extension identifies the "startPaymentGateway_INITRequest" entry and highlights it in bold. This helps you identify when payment attempts were made multiple times during a session, simplifying the troubleshooting process.

## How to Use

1. Make sure the extension is installed and activated in your Chrome browser.
2. Navigate to the AWS logs or the relevant checkout page you want to monitor.
3. Once the logs are loaded, the extension will automatically scan and highlight any errors in red.
4. It will also check for time gaps between requests and highlight those entries when the gap exceeds 15 seconds.
5. For checkout monitoring, look for the "startPaymentGateway_INITRequest" entry, which will be highlighted in bold.

## Feedback and Support

If you encounter any issues, have suggestions for improvements, or need support, please feel free to reach out to our support team at support@paymentssherifflogs.com. We value your feedback and are committed to making the extension more effective and user-friendly.

## Contribute

We welcome contributions from the community to enhance the extension's functionality and address any potential bugs. If you'd like to contribute, please fork the [GitHub repository](https://github.com/your-username/payments-sheriff-logs) and submit a pull request with your proposed changes.

## License

The "Payments Sheriff Logs" Chrome extension is released under the [MIT License](LICENSE). Feel free to use, modify, and distribute it in accordance with the terms of the license.

---

Thank you for using the "Payments Sheriff Logs" Chrome extension! We hope it streamlines your AWS log analysis and checkout monitoring, making your sheriffing tasks more efficient and enjoyable. If you find it helpful, don't forget to share it with your fellow sheriffs! Happy troubleshooting! :tada:
