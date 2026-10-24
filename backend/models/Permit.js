import mongoose from 'mongoose';

const permitSchema = new mongoose.Schema(
  {
    permit_no: {
      type: String,
      required: true,
      trim: true,
    },
    permit_type: {
      type: String,
      default: '',
      trim: true,
    },
    issue_date: {
      type: String,
      default: '',
    },
    expiry_date: {
      type: String,
      default: '',
    },
    worker_name: {
      type: String,
      required: true,
      trim: true,
    },
    iqama_no: {
      type: String,
      required: true,
      trim: true,
    },
    nationality: {
      type: String,
      default: '',
      trim: true,
    },
    job_title: {
      type: String,
      default: '',
      trim: true,
    },
    gender: {
      type: String,
      default: '',
      trim: true,
    },
    date_of_birth: {
      type: String,
      default: '',
    },
    iqama_mosasa_number: {
      type: String,
      default: '',
      trim: true,
    },
    iqama_mosasa: {
      type: String,
      default: '',
      trim: true,
    },
    company_name: {
      type: String,
      default: '',
      trim: true,
    },

 
    status: {
      type: Boolean,
      default: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Permit = mongoose.models.Permit || mongoose.model('Permit', permitSchema);

export default Permit;
