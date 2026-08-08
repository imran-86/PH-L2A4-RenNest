import cookieParser from "cookie-parser";
import express, { Application , Request,Response } from "express";
import cors from "cors";
import config from "./config";
import { userRoutes } from "./modules/user/user.route";
import { authRoutes } from "./modules/auth/auth.route";
import { propertyRoutes } from "./modules/properties/property.route";
import { landlordRoutes } from "./modules/landlord/landlord.route";
import { rentalRequestRoutes } from "./modules/RentalRequest/rental_request.route";
import { adminRoutes } from "./modules/admin/admin.route";
const app : Application = express();

app.use(cors({
    origin : config.app_url,
    credentials : true,
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.get("/", (req : Request, res : Response) => {
    res.send("Hello, World!");
});

app.use("/api/users", userRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/landloard",propertyRoutes)
app.use("/api/auth",authRoutes)
app.use("/api/landloard/properties",propertyRoutes)
app.use("/api/landloard/properties",propertyRoutes)
app.use("/api/properties",propertyRoutes)
app.use("/api/properties",propertyRoutes)

app.use("/api/rentals",rentalRequestRoutes)
app.use("/api/landlord/requests",
  landlordRoutes)

app.use("/api/admin",adminRoutes)



export default app;