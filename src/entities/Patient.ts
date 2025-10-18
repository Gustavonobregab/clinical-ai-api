import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, UpdateDateColumn, OneToMany
  } from "typeorm";
  import { Note } from "./Note";
  
  @Entity("patients")
  export class Patient {
    @PrimaryGeneratedColumn()
    id!: number;
  
    @Column({ type: "varchar", length: 160 })
    name!: string;
  
    @Column({ type: "date", nullable: true })
    dob?: string | null;
  
    @CreateDateColumn()
    createdAt!: Date;
  
    @UpdateDateColumn()
    updatedAt!: Date;

    @OneToMany(() => Note, (note) => note.patient)
    notes!: Note[];
  }
  