import * as userService from "./service.js";

// signup
// input: userName and password from req body
// res: status, success, message, user data
export const signup = async (req, res, next) => {
    try{
        const user = await userService.signup(req.body);
        res.status(201).json({
            success: true,
            message: "User created",
            user
        });
    }
    catch(err){
        next(err);
    }
};
// loging
// input: userName and password
// create session with user id
// res: status, success, message, user data
export const login = async (req, res, next) => {
    try{
        const user = await userService.login(req. body);

        req.session.userId = user.id;

        res.status(200).json({
            success: true,
            message: "Logged in",
            user
        });
    }
    catch(err){
        next(err);
    }
};
// logout
// input: req 
// destroy the session
// res: status, success, message
export const logout = (req, res, next) => {
    try{
        req.session.destroy((err) => {
            if(err){
                return next(err);
            }
            
            res.status(200).json({
                success: true,
                message: "Logged out"
            });
        });
    }
    catch(err){
        next(err);
    }
};

//update
// input: userId form session, data to update from req.body
// status, success, message, user data
export const updateUser = async (req, res, next) => {
    try{
        const updatedUser = await userService.updateUser(req.body);
        res.status(200).json({
            success: true,
            message: "User Updated",
            updatedUser
        });
    }
    catch(err){
        next(err);
    }
};
