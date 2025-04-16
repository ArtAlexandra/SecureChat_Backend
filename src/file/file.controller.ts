import { Controller, Get, Res, Param } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

@Controller('uploads')
export class FileController {
    @Get('/:filename')
    getFile(@Param('filename') filename: string, @Res() res: Response) {
        const filePath = join(__dirname, '../..', 'uploads', filename);

        if (!existsSync(filePath)) {
            return res.status(404).send('File not found');
        }

        return res.sendFile(filePath);
    }
}