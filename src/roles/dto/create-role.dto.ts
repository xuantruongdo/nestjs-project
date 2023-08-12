import { IsArray, IsMongoId, IsNotEmpty } from "class-validator";
import mongoose from "mongoose";

export class CreateRoleDto {
    @IsNotEmpty({ message: "Name không được để trống" })
    name: string;

    @IsNotEmpty({ message: "Description không được để trống" })
    description: string;

    @IsNotEmpty({ message: "IsActive không được để trống" })
    isActive: string;

    @IsNotEmpty({ message: "Permisstion không được để trống" })
    @IsMongoId({ each: true, message: "Mỗi permisstion phải có định dạng mongo id"})
    @IsArray({ message: "Permisstion có định dạng array" })
    permissions: mongoose.Schema.Types.ObjectId[];
}
