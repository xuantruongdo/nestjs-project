import { Transform, Type } from "class-transformer";
import { IsArray, IsBoolean, IsDate, IsDefined, IsNotEmpty, IsNotEmptyObject, IsObject, IsString, ValidateNested } from "class-validator";
import mongoose from "mongoose";


class Company {
    @IsNotEmpty()
    _id: string;

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    logo: string;
}
  
export class CreateJobDto {
    @IsNotEmpty({
        message: 'Name không được để trống'
    })
    name: string;

    @IsNotEmpty({message: 'Skills không được để trống'})
    @IsArray({ message: 'Skills có định dạng là mảng' })
    @IsString({each: true, message: "Skill định dạng là string"})
    skills: string[];

    @IsNotEmpty({
        message: 'Location không được để trống'
    })
    location: string;

    @IsNotEmpty({
        message: 'Salary không được để trống'
    })
    salary: number;

    @IsNotEmpty({
        message: 'Quantity không được để trống'
    })
    quantity: number;

    @IsNotEmpty({
        message: 'Level không được để trống'
    })
    level: string;

    @IsNotEmpty({
        message: 'Description không được để trống'
    })
    description: string;

    @IsNotEmpty({
        message: 'StartDate không được để trống'
    })
    @Transform(({ value }) => new Date(value))
    @IsDate({message: "StartDate có định dạng là Date"})
    startDate: Date;

    @IsNotEmpty({
        message: 'EndDate không được để trống'
    })
    @Transform(({ value }) => new Date(value))
    @IsDate({message: "EndDate có định dạng là Date"})
    endDate: Date;

    @IsNotEmpty({
        message: 'IsActive không được để trống'
    })
    @IsBoolean({ message: "IsActive có định dạng là Boolean"})
    isActive: boolean;

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Company)
    company: Company;
}
