/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Proposal } from './proposal.model';
import { User } from '../user/user.model';
import { Stake } from '../stake/stake.model';
import { TransactionService } from '../transaction/transaction.service';
import { UserService } from '../user/user.service';
import { BlockChainFunctions } from '../web3';
import { async } from 'rxjs/internal/scheduler/async';
import { DAOAttributes } from '../admin/admin.model';
import { EDESTADDRREQ } from 'constants';

const axios = require('axios');
const moment = require('moment');

@Injectable()
export class ProposalService {
  constructor(
    @InjectModel('Proposal') private readonly proposalModel: Model<Proposal>,
    // @InjectModel('Stake') private readonly stakeModel: Model<Stake>,
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('DAOAttributes')
    private readonly DAOAttributesModel: Model<DAOAttributes>,
    private readonly transactionService: TransactionService,
    private readonly userService: UserService,
  ) {
    console.log('proposall service');
  }

  getAllProposals = async () => {
    try {
      let date = new Date();
      console.log('dateee', moment(date).format('YYYY-MM-01, 00:00:00'));
      // this.votingResultCalculation({ body: { status: 'Voting' } });
      const result = await this.proposalModel.find();
      if (result.length !== 0) {
        return result;
      } else {
        throw 'No proposal found';
      }
    } catch (err) {
      throw err;
    }
  };

  postProposal = async (req, res) => {
    try {
      console.log(req.numioAddress);
      console.log('check milestone', req);
      const user = await this.userService.getUserById(req.numioAddress);
      if (!user) {
        throw { statusCode: 404, message: 'User not found' };
      }
      const statusTest = 'Incomplete';
      for (let i = 0; i < req.milestone.length; i++) {
        req.milestone[i].status = statusTest;
      }
      const Attributes = await this.DAOAttributesModel.find().exec();
      console.log('Attributes', Attributes.length);
      if (Attributes.length == 0) {
        throw { statusCode: 404, message: 'No attributes found!' };
      }
      const data = {
        ...req,
        minimumUpvotes: Attributes[0].minimumUpvotes,
      };
      console.log('Data ', data);
      const createdProposal = await this.proposalModel.create(data);
      console.log('Created Proposal', createdProposal);
      if (!createdProposal) {
        throw { statusCode: 404, message: 'Proposal not created' };
      }
      const createdTransaction = await this.transactionService.createTransaction(
        req.txHash,
        'Proposal',
        user.numioAddress,
        createdProposal._id,
      );
      console.log('Transaction', createdTransaction);
      return { createdProposal, createdTransaction };
    } catch (err) {
      console.log('view erro nor', err);
      throw err.message;
    }
  };

  getProposalsById = async id => {
    try {
      const result = await this.proposalModel.findById(id);

      return result;
    } catch (err) {
      // console.log(err);
      throw 'No Proposal Found';
    }
  };
  updateProposalStatus = async (id, status) => {
    try {
      let Attributes = [];
      const proposal = await this.proposalModel.findById(id);

      if (!proposal) {
        throw { statusCode: 404, message: 'Proposal Not Found' };
      }
      if (status === 'UpVote') {
        Attributes = await this.DAOAttributesModel.find().exec();
        console.log('Attributes', Attributes.length);
        if (Attributes.length == 0) {
          throw { statusCode: 404, message: 'No attributes found!' };
        }
        const expirationDate = moment()
          .add(Attributes[0].maxUpvoteDays, 'd')
          .format('YYYY-MM-DD');
        console.log('expirationDate ==>', expirationDate);

        const result = await this.proposalModel.findByIdAndUpdate(
          id,
          {
            $set: { status: status, expirationDate: expirationDate },
          },
          { runValidators: true, new: true },
        );
        return result;
      } else if (status === 'Accepted') {
        console.log("in here 1")
        // console.log("proposal is" , proposal)
        let completionDays=0, estCompletionDate;
        for (let t = 0; t < proposal.milestone.length; t++) {
          console.log("typesss of milestone days",typeof Number(proposal.milestone[t].days) )
          completionDays += Number(proposal.milestone[t].days);
        }
        console.log("in here 2")
        console.log("completion datas calculated",completionDays)
        estCompletionDate = moment(Date.now())
          .add(completionDays, 'days')
          .format();
          console.log("in here 3")
        const result = await this.proposalModel.findByIdAndUpdate(
          id,
          {
            $set: { status: 'Accepted', estCompletionDate },
          },
          { runValidators: true, new: true },
        );
      console.log("in here 4")
        return result;
      }

      const result = await this.proposalModel.findByIdAndUpdate(
        id,
        {
          $set: { status: status },
        },
        { runValidators: true, new: true },
      );
      return result;
    } catch (err) {
      throw 'Error';
    }
  };
  getProposalByNumioAddress = async numioAddress => {
    try {
      const result = await this.proposalModel.find({
        numioAddress: numioAddress,
      });
      if (result.length == 0) {
        throw { statusCode: 404, message: 'Not Proposal Found' };
      }
      return result;
    } catch (err) {
      throw { status: 400, message: err.message };
    }
  };
  getProposalByNumioAddressAndProposalStatus = async (numioAddress, status) => {
    try {
      const result = await this.proposalModel.find({
        numioAddress: numioAddress,
        status: status,
      });
      if (result.length == 0) {
        throw { statusCode: 404, message: 'Not Proposal Found' };
      }
      return result;
    } catch (err) {
      throw { status: 400, message: err.message };
    }
  };

  VoteOnProposal = async (req, res) => {
    try {
      const proposal = await this.proposalModel.findById(req.params.id);

      if (!proposal) {
        throw { statusCode: 404, message: 'Proposal Not Found' };
      }

      if (proposal.status !== 'UpVote') {
        throw { statusCode: 400, message: 'Proposal cannot be upvoted' };
      }

      const checkUserExist = await this.userModel.find({
        email: req.body.email,
      });
      if (checkUserExist.length == 0) {
        throw { statusCode: 400, message: 'User does not exist' };
      }
      const check = proposal.votes.some(el => {
        //Here is the name validation (A user cannot vote twice)
        if (el.email == req.body.email) {
          throw { statusCode: 400, message: 'User cannot vote again' };
        }
      });

      const result = await this.proposalModel.findByIdAndUpdate(
        req.params.id,
        {
          $push: {
            votes: { date: Date.now(), email: req.body.email },
          },
        },
        { runValidators: true, new: true },
      );

      const result2 = await this.userModel.findOneAndUpdate(
        { email: req.body.email },
        { $push: { proposalVote: result._id } },
      );

      const checkCount = await this.proposalModel.findById(req.params.id);
      const Attributes = await this.DAOAttributesModel.find().exec();
      console.log('Attributes', Attributes.length);
      if (Attributes.length == 0) {
        throw { statusCode: 404, message: 'No attributes found!' };
      }
      if (checkCount.votes.length > result.minimumUpvotes - 1) {
        await this.updateProposalStatus(req.params.id, 'Voting');
        let date = new Date();

        console.log(date.getDate());
        if (date.getDate() < 16) {
          date = moment(Date.now())
            .add(1, 'M')
            .format('YYYY-MM-02, 00:00:00');
          console.log('hellow oirkds');
        } else {
          date = moment(Date.now())
            .add(2, 'M')
            .format('YYYY-MM-02, 00:00:00');
        }

        console.log('date now', date);
        const setMonth = await this.proposalModel.findByIdAndUpdate(
          req.params.id,
          { $set: { votingDate: date } },
        );
      }
      console.log('Length Of the Array', checkCount.votes.length);
      return 'Success';
    } catch (err) {
      throw { statusCode: 400, message: err.message };
    }
  };

  getProposalsByStatus = async req => {
    try {
      //console.log('Status ===>>>>', status);
      const result = await this.proposalModel.find({ status: req.body.status });
      return result;
    } catch (err) {
      throw err;
    }
  };
  changeStatusOfMilestoneByAdmin = async (req, res) => {
    try {
      if (!req.params.id) {
        throw {
          statusCode: 400,
          message: 'Please provide proposal id in params',
        };
      }

      const result = await this.proposalModel.findById(req.params.id);
      console.log('-----', result);
      if (req.body.index > result.milestone.length) {
        throw {
          statusCode: 400,
          message: 'Index must not be greater then the total milestones',
        };
      }
      if (result.status != 'Accepted') {
        throw { statusCode: 400, message: 'Invalid Status' };
      }
      if (!result) {
        throw { statusCode: 404, message: 'Proposal not found!' };
      }
      if (!req.body.numioAddress) {
        throw { statusCode: 400, message: 'Must Provide Numio Address' };
      }
      const user = await this.userModel.findOne({
        numioAddress: req.body.numioAddress,
      });
      if (!user) {
        throw { statusCode: 400, message: 'User not found' };
      }
      if (user.isAdmin == false) {
        throw { statusCode: 400, message: 'User must be the admin' };
      }
      if (user.isAdmin) {
        result.milestone[req.body.index].status = req.body.status;
        console.log('result', result);
        result.markModified('milestone');
        result.save();
      }
      return result;
    } catch (err) {
      throw { statusCode: 400, message: err.message };
    }
  };

  changeStatusOfMilestoneByUser = async (req, res) => {
    try {
      if (!req.params.id) {
        throw {
          statusCode: 400,
          message: 'Please provide proposal id in params',
        };
      }
      const result = await this.proposalModel.findById(req.params.id);

      if (!result) {
        throw { statusCode: 404, message: 'Proposal not found!' };
      }
      if (result.status != 'Accepted') {
        throw { statusCode: 400, message: 'Invalid Status' };
      }
      console.log('Result', result.length);
      if (req.body.index > result.milestone.length) {
        throw {
          statusCode: 400,
          message: 'Index must not be greater then the total milestones',
        };
      }

      if (!req.body.numioAddress) {
        throw { statusCode: 400, message: 'Must Provide Numio Address' };
      }
      const user = await this.userModel.findOne({
        numioAddress: req.body.numioAddress,
      });
      if (!user) {
        throw { statusCode: 400, message: 'User not found' };
      }
      if (result.numioAddress != user.numioAddress) {
        throw { statusCode: 400, message: 'Invalid User, user must be same' };
      }
      console.log('Proposal status', result);
      if (req.body.status == 'Completed') {
        result.milestone[req.body.index].status = 'Pending';
      } else if (req.body.status == 'Incomplete') {
        result.milestone[req.body.index] = 'Incomplete';
      }

      result.markModified('milestone');
      result.save();

      return result;
    } catch (err) {
      throw { statusCode: 400, message: err.message };
    }
  };

  updateProposalEstCompleteDateAndGitHubLink = async req => {
    try {
      console.log('in updateProposalEstCompleteDateAndGitHubLink service');
      console.log('params id', req.params.id);
      console.log('body', req.body);

      const proposal = await this.proposalModel.findById(req.params.id);
      if (!proposal) {
        throw { statusCode: 404, message: 'Proposal not found!' };
      }
      // console.log('status', proposal.status);
      // if (proposal.status != 'Pending') {
      //   throw {
      //     statusCode: 400,
      //     message:
      //       'Proposal can only be update before admin approves it (status pending)',
      //   };
      // }
      const user = await this.userModel.findOne({
        numioAddress: req.body.numioAddress,
      });
      if (!user) {
        throw {
          statusCode: 404,
          message: 'User with provided numioAddress doesnot exist',
        };
      }
      console.log('user.numioAddress ', user.numioAddress);
      console.log('req.body.numioAddress', req.body.numioAddress);
      if (user.numioAddress != proposal.numioAddress) {
        throw { statusCode: 401, message: 'Unauthorized!' };
      }
      const updateProposal = await this.proposalModel.findByIdAndUpdate(
        proposal._id,
        {
          githubLink:req.body.githubLink,
          estCompletionDate:req.body.estCompletionDate
          // collateral: req.body.proposal.collateral,
        },
        { runValidators: true, new: true },
      );
      console.log('updateProposal ', updateProposal);
      return updateProposal;
    } catch (err) {
      console.log("------------ ",err,"-----")
      throw {message:err.message,statusCode:400};
    }
  };

  updateProposal = async req => {
    try {
      console.log('in update service');
      console.log('params id', req.params.id);
      console.log('body', req.body);

      const proposal = await this.proposalModel.findById(req.params.id);
      if (!proposal) {
        throw { statusCode: 404, message: 'Proposal not found!' };
      }
      console.log('status', proposal.status);
      if (proposal.status != 'Pending') {
        throw {
          statusCode: 400,
          message:
            'Proposal can only be update before admin approves it (status pending)',
        };
      }
      const user = await this.userModel.findOne({
        numioAddress: req.body.numioAddress,
      });
      if (!user) {
        throw {
          statusCode: 404,
          message: 'User with provided numioAddress doesnot exist',
        };
      }
      console.log('user.numioAddress ', user.numioAddress);
      console.log('req.body.numioAddress', req.body.numioAddress);
      if (user.numioAddress != proposal.numioAddress) {
        throw { statusCode: 401, message: 'Unauthorized!' };
      }
      const updateProposal = await this.proposalModel.findByIdAndUpdate(
        proposal._id,
        {
          budget: req.body.proposal.budget,
          name: req.body.proposal.name,
          description: req.body.proposal.description,
          milestone: req.body.proposal.milestone,
          // collateral: req.body.proposal.collateral,
        },
        { runValidators: true, new: true },
      );
      console.log('updateProposal ', updateProposal);
      return updateProposal;
    } catch (err) {
      throw err;
    }
  };

  deleteProposal = async req => {
    try {
      console.log('in delete service');
      console.log('params', req.params);

      const proposal = await this.proposalModel.findById(req.params.id);
      if (!proposal) {
        throw { statusCode: 404, message: 'Proposal not found!' };
      }
      console.log('status', proposal.status);
      if (proposal.status != 'Pending' && proposal.status != 'Rejected') {
        throw {
          statusCode: 400,
          message:
            'Proposal can only be deleted before admin approves it (status pending)',
        };
      }
      const user = await this.userModel.findOne({
        numioAddress: req.body.numioAddress,
      });
      console.log('user is ', user);
      if (!user) {
        throw {
          statusCode: 404,
          message: 'User with provided numioAddress doesnot exist',
        };
      }
      if (user.numioAddress != proposal.numioAddress) {
        throw { statusCode: 401, message: 'Unauthorized!' };
      }
      const deletedProposal = await this.proposalModel.findOneAndDelete({
        _id: proposal._id,
      });
      console.log('deletedProposal ', deletedProposal);
      return deletedProposal;
    } catch (err) {
      throw err;
    }
  };
}
