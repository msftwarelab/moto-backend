import express from 'express';
import path from 'path';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import expressJwt from 'express-jwt';
import expressGraphQL from 'express-graphql';
import PrettyError from 'pretty-error';

// configurations
import { auth, port, environment } from './config';

// GraphQL
import models from './data/models';
import schema from './data/schema';
import pushNotificationRoutes from './libs/pushNotificationRoutes';

// JWT Auth Middleware
import { verifyJWT_MW } from './libs/middleware';

const app = express();
const __DEV__ = environment;
app.use(compression());

// Middlewares
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Authentication
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
    next();
});

app.use(expressJwt({
    secret: auth.jwt.secret,
    credentialsRequired: false,
    getToken: req => req.headers.authToken,
}));

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.send({
            status: 400,
            errorMessage: 'Invalid auth token provided.'
        });
        next();
    }
});

app.use(verifyJWT_MW);

if (__DEV__) {
    app.enable('trust proxy');
}

pushNotificationRoutes(app);

// Express GraphQL 
const graphqlMiddleware = expressGraphQL((req, res) => ({
    schema,
    graphiql: __DEV__,
    rootValue: {
        request: req,
        response: res
    },
    pretty: __DEV__,
}));

app.use('/graphql', graphqlMiddleware);

//
app.post('/check', function (req, res) {
    console.log('Watch asd asd', req.headers);
    res.sendStatus(200);
});

// Error Handling
const pe = new PrettyError();
pe.skipNodeFiles();
pe.skipPackage('express');

// Server launch
models.sync().catch(err => console.log(err.stack)).then(() => {
    app.listen({ port: port }, () =>
        console.log(`Server ready at http://localhost:${port}`),
    )
});