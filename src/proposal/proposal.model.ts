/* eslint-disable @typescript-eslint/no-empty-interface */
import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;
export const ProposalSchema = new Schema({
  budget: { type: Number, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  milestone: { type: Array, required: true },
  votingDate: { type: Date },
  stake: [],
  votes: [],
  numioAddress: { type: String, required: true },
  colletral: { type: Number, required: true },
  
  reward: { type: Number, required: true },
  status: {
    type: String,
    default: 'Pending',
    enum: ['Pending', 'Rejected', 'Accepted', 'UpVote', 'Voting'],
  },
});

export interface Proposal {}