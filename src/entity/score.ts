import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Score {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    submittedDate: Date;

    @Column()
    score: number;

    @Column()
    lines: number;

    @Column()
    replay: string;

}
