# NLU Integration for Watson Assistant

This repo contains a microservice that has an API for making requests to IBM Natural Language Understanding to analyze text and return identified location, concepts, and entities. This service can then be integrated with a Watson Assistant virtual assistant through a custom extension. The OpenAPI document is also listed in this repo which is required to create a custom extension in Watson Assistant. 

## Important Files
- app.js: Routes NLU requests for the `/nlu` path over to `routes/nlu_handler.js`
- nlu_handler.js: Takes text from the `text` query parameter and sends it to NLU for text analysis. Returns an object containing identified location, an array of entities, and an array of concepts.
- openapi.json: OpenAPI document that is required for creating a custom extension in Watson Assistant
- Dockerfile: The file used to build the container image

## Prerequisites

- Nodejs (I used Node 18)
- An IBM Cloud Account
- Docker or Podman (If you want to run as a container)

## Running the application


1. Build the application with:

    ```sh
    npm install
    ```

1. Create an environment variable for the NLU apikey

    ```sh
    export nlu_apikey=xxxxxxxxxxxxxxxx
    ```

1. Create an environment variable for the NLU service endpoint

    ```sh
    export nlu_url=xxxxxxxxxxxxxxxxxxxx
    ```

1. Run the application 

    ```sh
    npm start
    ```

## Accessing the application

There is no frontend for this service. You can access the application by sending a GET request with a REST client or by using your browser. 

1. Come up with some text that you want NLU to analyze. For example:

    ```
    Austin has a lot of tech communities involving data science and DevOps with members from companies such as IBM and Salesforce.
    ```

1. Reach your locally running application at `localhost:300/nlu` and adding the text query param with the text you want to analyze as seen below :

    1. If you use a browser, you can just enter the following directly into your address bar.

    ```
    localhost:3000/nlu?text=Austin has a lot of tech communities involving data science and DevOps with members from companies such as IBM and Salesforce
    ```

    1. If you are using CURL:

    ```sh
    curl "localhost:3000/nlu?text=Austin has a lot of tech communities involving data science and DevOps with members from companies such as IBM and Salesforce"
    ```

1. View the results

    ```json
    {"location":"Austin","concepts":["DevOps","Data science","Science"],"entities":["IBM","Salesforce"]}
    ```

## Builing the container
If you want to containerize the application, you can use Podman or Docker to create the container image using the included Dockerfile.

You will need to replace all values in `<>` with their respective values.

1. To build

    ```sh
    docker build -t <image registry>/<organization/<image name>:<your image tag here> .
    ```

1. To push to your registry

    ```sh
    docker push <image registry>/<organization/<image name>:<your image tag here>
    ```

1. If you want to run from the container locally you can do the following, replacing the `nlu_apikey` and `nlu_url` values with the credentials from your own instance:

    ```sh
    docker run -p 3000:3000 -e nlu_apikey=xxxxxxxx -e nlu_url=xxxxxxxxxx <image registry>/<organization/<image name>:<your image tag here>
    ```

## Deploying the application

There are many ways to deploy the application whether you use a PaaS, a container platform like OpenShift or Kubernetes, or any other container hosting solution. 

For my demo, I used [IBM Code Engine](https://cloud.ibm.com/docs/codeengine?topic=codeengine-getting-started) which allows you to run a container workload without needing to manage the container orchestration platform underneath as it was the easiest for me to implement. 