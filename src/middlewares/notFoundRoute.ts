import { Request, Response } from "express"

export const notFoundRoute = (req: Request, res: Response) => {
    res.status(404).json({
        message: "Route that you are hit , not found",
        path: req.originalUrl,
        date: new Date()
    })
}