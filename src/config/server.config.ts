const dotenv = require("dotenv");
dotenv.config();

export const serverConfig = {
    PORT: process.env.PORT || 50051,
};