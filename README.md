# Matt Mallett tweet map project
mm4673
m.mallett@columbia.edu

## info
uses the public twitter stream to track mentions of 2016 presidential candidates

built with
node.js/express/socket.io application layer
mongodb by mongolab
jquery/bootstrap frontend

(don't look at my code, it is awful)

## running
requires node

to install dependencies and run the server on localhost:9000
```npm install```
```npm start```

## deploying to ebs
a runthrough of an ebs deploy is included in the file ```typescript```

first install eb client, then run the ```eb init``` command to enter your credentials and select an aws zone

then use ```eb create``` to create an ebs environment and push the code to ebs
