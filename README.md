# Room Reservation Automation with Azure Functions

## Overview

This project automates the process of reserving group working spaces at LUT University using Azure Functions. The reservation system is based on Microsoft Bookings, and this automation streamlines the process by making reservations for multiple hours across a day, bypassing the manual steps of logging in, selecting dates, rooms, and timeslots.

The solution leverages **Azure Functions** with **Playwright** for web automation, integrated with **Azures Storage** (via Azurite for local development).

## Features

- **Automated Room Reservation**: Automates the full-day reservation process, selecting available rooms and timeslots.
- **Headless Mode Configuration**: Configures the system to run in headless mode for production and full UI for local development.
- **Error Handling**: Handles errors such as unavailable timeslots and other dynamic elements like changing calendar dates.
- **Discrod integration**: Sends a timetable to a Discord channel of created reservations.

## Architecture

- **Azure Functions**: Timer-triggered functions automate the room reservation process at scheduled intervals using Node programming model v4.
- **Playwright**: Web automation library used to interact with Microsoft Bookings' user interface, including the calendar, building, room, and timeslot selection.
- **Azurite (Local Development)**: Emulates Azure Storage locally for testing and development purposes.

## Prerequisites

To run this project locally, you'll need:

- [Node.js](https://nodejs.org/) (v20 or higher)
- [TypeScript](https://www.typescriptlang.org/) (v4 or higher)
- [Azure Functions Core Tools](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local)
- [Visual Studio Code](https://code.visualstudio.com/) (recommended)
- [Azure Functions Extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurefunctions) (for Visual Studio Code)
- [Azurite](https://github.com/Azure/Azurite) (for local Azure Storage emulation)

## TroubleShooting

If Azurite default ports are already in use, you can either change the ports or kill the processes using the following commands:

Kill process:
```bash
netstat -ano | findstr <PORT_NUMBER>
taskkill /PID <PID> /F
```

Change ports:
```bash
azurite --blobPort <PORT_NUMBER> --queuePort <PORT_NUMBER> --tablePort <PORT_NUMBER>
```