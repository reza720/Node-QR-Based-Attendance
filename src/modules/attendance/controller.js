import * as attendanceService from "./service.js";

// Scan controller
// req: token from body
// res: success, status, message, and data returned from service
export const scanAttendance = async (req, res, next)=> {
    try{
        const attendance = await attendanceService.scanAttendanceService(req.body);
        res.status(200).json({
            success: true,
            message: "Attendance marked",
            attendance
        });
    }
    catch(err){
        next(err);
    }
}
// get to day attendace
// req: just call the service and store
// res: success, status, message, and data returned from service
export const todayAttendance = async (req, res, next) => {
    try{
        const todayAttendance = await attendanceService.todayAttendance();
        res.status(200).json({
            success: true,
            message: "Today's attendance records retrieved successfully",
            todayAttendance
        });
    }
    catch(err){
        next(err);
    }
}

// get All Attendace Controller
// req: Quary parameters
// as previous module

