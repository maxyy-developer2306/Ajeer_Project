import Permit from '../models/Permit.js';
import { syncDatabases } from '../config/db.js';

export const getPermits = async (req, res) => {
  try {
    // $or use kiya hai taake agar deletedAt null ho ya field exist hi na karti ho, tab bhi data aaye
    const permits = await Permit.find({
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }]
    }).sort({ createdAt: -1 });
    return res.json(permits);
  } catch (error) {
    console.error('Get permits error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getPermitById = async (req, res) => {
  try {
    const permit = await Permit.findOne({
      _id: req.params.id,
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }]
    });

    if (!permit) {
      return res.status(404).json({ message: 'Permit not found' });
    }

    return res.json(permit);
  } catch (error) {
    console.error('Get permit by id error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const createPermit = async (req, res) => {
  try {
    const {
      permit_no,
      permit_type,
      issue_date,
      expiry_date,
      worker_name,
      iqama_no,
      nationality,
      job_title,
      gender,
      date_of_birth,
      iqama_mosasa_number,
      iqama_mosasa,
      status,
    } = req.body;

    if (!permit_no || !worker_name || !iqama_no) {
      return res.status(400).json({ message: 'Permit number, worker name and iqama are required' });
    }

    const permit = await Permit.create({
      permit_no,
      permit_type: permit_type || '',
      issue_date: issue_date || '',
      expiry_date: expiry_date || '',
      worker_name,
      iqama_no,
      nationality: nationality || '',
      job_title: job_title || '',
      gender: gender || '',
      date_of_birth: date_of_birth || '',
      iqama_mosasa_number: iqama_mosasa_number || '',
      iqama_mosasa: iqama_mosasa || '',
      status: status ?? true,
    });
    await syncDatabases();

    return res.status(201).json({ message: 'Permit created', permit });
  } catch (error) {
    console.error('Create permit error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const updatePermit = async (req, res) => {
  try {
    const permit = await Permit.findOneAndUpdate(
      { 
        _id: req.params.id, 
        $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] 
      },
      req.body,
      { new: true, runValidators: true }
    );

    if (!permit) {
      return res.status(404).json({ message: 'Permit not found' });
    }
    await syncDatabases();

    return res.json({ message: 'Permit updated', permit });
  } catch (error) {
    console.error('Update permit error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const deletePermit = async (req, res) => {
  try {
    const permit = await Permit.findOneAndUpdate(
      { 
        _id: req.params.id, 
        $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] 
      },
      { $set: { deletedAt: new Date(), status: false } },
      { new: true }
    );

    if (!permit) {
      return res.status(404).json({ message: 'Permit not found' });
    }
    await syncDatabases();

    return res.json({ message: 'Permit deleted' });
  } catch (error) {
    console.error('Delete permit error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};