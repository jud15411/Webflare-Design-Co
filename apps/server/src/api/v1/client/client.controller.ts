import { type Response } from 'express';
import { type AuthRequest } from '../../middleware/auth.middleware.js';
import { Client } from './client.model.js';
import { ClientUser } from './clientUser.model.js';

// ... (createClient function remains the same) ...
export const createClient = async (req: AuthRequest, res: Response) => {
  try {
    const newClient = await Client.create(req.body);
    res.status(201).json(newClient);
  } catch (error) {
    res.status(500).json({ message: 'Error creating client.', error });
  }
};

// @desc    Get all clients
// @route   GET /api/v1/clients
export const getClients = async (req: AuthRequest, res: Response) => {
  try {
    const clients = await Client.find()
      .populate('assignedTeamMembers', 'name')
      .sort({ clientName: 1 })
      .lean(); // Use .lean() to get plain objects

    // Asynchronously find all relevant client user records in one go
    const clientIds = clients.map((c) => c._id);
    const clientUsers = await ClientUser.find({ client: { $in: clientIds } });

    // Create a map for quick lookups
    const clientUserMap = new Map(
      clientUsers.map((cu) => [cu.client.toString(), cu.portalAccessGranted])
    );

    // Add the portal access status to each client object
    const clientsWithAccess = clients.map((client) => ({
      ...client,
      portalAccessGranted: clientUserMap.get(client._id.toString()) || false,
    }));

    res.status(200).json(clientsWithAccess);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching clients.', error });
  }
};

// ... (getClientById, updateClient, deleteClient, togglePortalAccess functions remain the same) ...
export const getClientById = async (req: AuthRequest, res: Response) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate('assignedTeamMembers', 'name')
      .populate('assignedProjects', 'name')
      .lean(); // Use .lean() for a plain object

    if (!client) {
      return res.status(404).json({ message: 'Client not found.' });
    }

    // Find the associated client user to get the portal status
    const clientUser = await ClientUser.findOne({ client: client._id });

    // Add the portal access status to the client object
    const clientWithAccess = {
      ...client,
      portalAccessGranted: clientUser ? clientUser.portalAccessGranted : false,
    };

    res.status(200).json(clientWithAccess);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching client details.', error });
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
    res.status(200).json({
      message: 'Portal access updated successfully.',
      portalAccessGranted: clientUser.portalAccessGranted,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling portal access.', error });
  }
};
