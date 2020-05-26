import session from "./session";
import user from "./user";
import userMessage from './user_message';
import userFile from "./user_file";


const SVURouter = (app, config) => {
  let appRoot = config.get("app_root");

  app.use(appRoot + "/session", session);
  app.use(appRoot + "/user", user);
  app.use(appRoot + "/message", userMessage);
  app.use(appRoot + "/file", userFile);
}

export default SVURouter;