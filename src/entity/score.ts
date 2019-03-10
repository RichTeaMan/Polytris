import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, BaseEntity } from "typeorm";

@Entity("Score")
export class Score {

    @PrimaryGeneratedColumn({ name: "Id" })
    public id: number;

    @Column({ name: "Name", length: "50" })
    public name: string;

    @CreateDateColumn({ name: "SubmittedDate" })
    public submittedDate: Date;

    @Column({ name: "Score", type: "int" })
    public score: number;

    @Column({ name: "Lines", type: "int" })
    public lines: number;

    @Column({ name: "Replay", type: "ntext" })
    public replay: string;

}
