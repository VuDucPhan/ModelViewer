### Note
> For a more detailed step-by-step tutorial explaining the setup and usage of this sample, please visit: https://github.com/autodesk-platform-services/aps-simple-viewer-nodejs

This sample application demonstrates the following aspects of the APS Viewer:

- Authentication using 2-legged context
- Upload and translation of files to SVF2 format 
- Loading and rendering of models in the viewer
- Basic viewer customization (setting background color, adding toolbar buttons, etc.)


### Setup & Run

- Clone this repository: `git clone https://github.com/autodesk-platform-services/aps-simple-viewer-nodejs`
- Go to the project folder: `cd aps-simple-viewer-nodejs`
- Install Node.js dependencies: `npm install`
- Open the project folder in a code editor of your choice
- Create a _.env_ file in the project folder, and populate it with the snippet below,
replacing `<client-id>` and `<client-secret>` with your APS Client ID and Client Secret:

```bash
APS_CLIENT_ID="<client-id>"
APS_CLIENT_SECRET="<client-secret>"
```

- Run the application, either from your code editor, or by running `npm start` in terminal
- Open http://localhost:8080

