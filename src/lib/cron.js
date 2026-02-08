import cron from "node-cron";
import { checkUpcomingTasks } from "../services/todo.service.js";

export const initCronJobs = () => {
    // Run every minute
    cron.schedule("* * * * *", () => {
        console.log("Running task reminder check...");
        checkUpcomingTasks();
    });
};
