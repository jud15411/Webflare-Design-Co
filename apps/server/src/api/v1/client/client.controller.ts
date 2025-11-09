// client.controller.ts

import { type Response } from 'express';
import { Types, Document } from 'mongoose';
import { type AuthRequest } from '../../middleware/auth.middleware.js';
import { Client, IClient } from './client.model.js'; // Import IClient
import { ClientUser } from './clientUser.model.js';

interface IClientWithPortalStatus extends IClient {
  portalAccessGranted: boolean; 
}

export const createClient = async (req: AuthRequest, res: Response) => {
  try {
    const newClient = await Client.create(req.body);
    res.status(201).json(newClient);
  } catch (error) {
    res.status(500).json({ message: 'Error creating client.', error });
  }
};

export const getClients = async (req: AuthRequest, res: Response) => {
  try {
    const clients = (await Client.find()
      .populate('assignedTeamMembers', 'name')
      .sort({ clientName: 1 })) as (IClient & Document)[];

    const clientIds = clients.map((c) => c._id as Types.ObjectId); 
    const clientUsers = await ClientUser.find({ client: { $in: clientIds } });

    const clientUserMap = new Map(
      clientUsers.map((cu) => [cu.client.toString(), cu.portalAccessGranted])
    );

    const clientsWithPortalStatus = clients.map((client) => {
      const clientObject = client.toObject({ virtuals: true }) as unknown as IClientWithPortalStatus;
      
      const accessStatus = clientUserMap.get((clientObject._id as Types.ObjectId).toString());

      clientObject.portalAccessGranted = accessStatus ?? false;

      return clientObject;
    });

    res.status(200).json(clientsWithPortalStatus);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Error fetching clients.', error });
  }
};


export const getClientById = async (req: AuthRequest, res: Response) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate('assignedTeamMembers', 'name')
      .populate('assignedProjects', 'name');
      
    if (!client) {
      return res.status(404).json({ message: 'Client not found.' });
    }

    const clientUser = await ClientUser.findOne({ client: client._id });

    const clientObject = client.toObject({ virtuals: true }) as unknown as IClientWithPortalStatus;
    
    clientObject.portalAccessGranted = clientUser ? clientUser.portalAccessGranted : false;

    res.status(200).json(clientObject);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching client.', error });
  }
};

export const updateClient = async (req: AuthRequest, res: Response) => {
  try {
    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedClient) {
      return res.status(404).json({ message: 'Client not found.' });
    }
    res.status(200).json(updatedClient);
  } catch (error) {
    res.status(500).json({ message: 'Error updating client.', error });
  }
};

export const deleteClient = async (req: AuthRequest, res: Response) => {
  try {
    const deletedClient = await Client.findByIdAndDelete(req.params.id);
    if (!deletedClient) {
      return res.status(404).json({ message: 'Client not found.' });
    }
    res.status(200).json({ message: 'Client deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting client.', error });
  }
};

export const togglePortalAccess = async (req: AuthRequest, res: Response) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found.' });
    }

    let clientUser = await ClientUser.findOne({ client: client._id });

    if (clientUser) {
      clientUser.portalAccessGranted = !clientUser.portalAccessGranted;
    } else {
      clientUser = new ClientUser({
        email: client.primaryContact.email, 
        client: client._id,
        portalAccessGranted: true,
      });
    }

    await clientUser.save();
    const action = clientUser.portalAccessGranted ? 'granted' : 'revoked';

    res.status(200).json({
      message: `Client portal access ${action} successfully.`,
      portalAccessGranted: clientUser.portalAccessGranted,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling client portal access.', error });
  }
};