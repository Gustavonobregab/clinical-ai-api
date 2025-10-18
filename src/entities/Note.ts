import {
    Entity, PrimaryGeneratedColumn, Column, ManyToOne,
    CreateDateColumn, UpdateDateColumn, Index
  } from "typeorm";
  import { Patient } from "./Patient";
  

  export type NoteInputType = "TEXT" | "AUDIO";
  export type NoteStatus = "CREATED" | "PROCESSED" | "FAILED";
  
  @Entity("notes")
  export class Note {
    @PrimaryGeneratedColumn()
    id!: number;
  
    @ManyToOne(() => Patient, (patient) => patient.notes, { onDelete: "CASCADE" })
    @Index()
    patient!: Patient;
  
    @Column({ type: "enum", enum: ["TEXT", "AUDIO"], default: "TEXT" })
    inputType!: NoteInputType;
  
    @Column({ type: "text", nullable: true})
    rawText!: string;
  
    @Column({ type: "text", nullable: true })
    summary?: string;
  
    @Column({ type: "varchar", length: 512, nullable: true })
    audioUrl?: string;
  
    @Column({ type: "jsonb", nullable: true })
    aiMeta?: Record<string, any>; 
  
    @Column({ type: "enum", enum: ["CREATED", "PROCESSED", "FAILED"], default: "CREATED" })
    status!: NoteStatus;
  
    @CreateDateColumn()
    createdAt!: Date;
  
    @UpdateDateColumn()
    updatedAt!: Date;
  }
  