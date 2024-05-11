run the init code (or follow the procedure) before running the servers.

1. `docker run --name pwd_db -p 8084:27017 --restart=no -d mongodb/mongodb-community-server:latest`
2. in the 4 folders, run `npm install` to install the dependencies.
3. to run the clients and servers, go into respective folders and run `npm start`.