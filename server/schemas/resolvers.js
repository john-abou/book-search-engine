const { Book, User } = require('../models');
const { AuthenticationError } = require('apollo-server-express');

const resolvers = {
  Query: {
    // GET all users - replace getSingleUser controller with this
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select('-__v -password')
          .populate('savedBooks');

        return userData;
      },


    },
    Mutation: {
      // CREATE a user - replace createUser controller with this
      addUser: async (parent, args) => {
        const user = await User.create(args);
        const token = signToken(user);

        return { token, user };
      },
      // LOGIN a user - replace login controller with this
      login: async (parent, { email, password }) => {
        try{
          const user = await User.findOne({email});

          if (!user) {
            throw new AuthenticationError('Incorrect credentials');
          }
        } catch(err) {
          console.log(err);
          return res.status(400).json(err);
        }

        const correctPassword = await user.isCorrectPassword(password);

        if (!correctPassword) {
          throw new AuthenticationError('Incorrect credentials');
        }

        const token = signToken(user);

        return ({ token, user }); 
      },
      // SAVE a book - replace saveBook controller with this
      saveBook: async (parent, { bookData }, context) => { 
        try{
          const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $addToSet: { savedBooks: bookData } },
            { new: true, runValidators: true }
          );
          return updatedUser;
        }
        catch(err){
          console.log(err);
          return res.status(400).json(err);
        }
      },
      // REMOVE a book - replace removeBook controller with this
      removeBook: async (parent, { bookId }, context) => {
        try{
          const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $pull: { savedBooks: { bookId: bookId } } },
            { new: true }
          );
          return updatedUser;
        } catch(err){
          console.log(err);
          return res.status(400).json(err);
        }
      }
    }
  };