import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import CasosList from './CasosList';
import CasoFormDialog from './CasoFormDialog';
import { Caso } from '../../types';

const CasosPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedCaso, setSelectedCaso] = useState<Caso | undefined>(undefined);
  const [refreshList, setRefreshList] = useState(0);

  const handleCreateCaso = () => {
    setSelectedCaso(undefined);
    setShowForm(true);
  };

  const handleEditCaso = (caso: Caso) => {
    setSelectedCaso(caso);
    setShowForm(true);
  };

  const handleViewCaso = (caso: Caso) => {
    // TODO: Implement view caso functionality
    console.log('View caso:', caso);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedCaso(undefined);
  };

  const handleSaveCaso = (caso: Caso) => {
    // Refresh the list
    setRefreshList(prev => prev + 1);
    setShowForm(false);
    setSelectedCaso(undefined);
  };

  return (
    <Container maxWidth="xl">
      <Box py={3}>
        <CasosList
          key={refreshList} // Force re-render when refreshList changes
          onCreateCaso={handleCreateCaso}
          onEditCaso={handleEditCaso}
          onViewCaso={handleViewCaso}
        />
        
        <CasoFormDialog
          open={showForm}
          caso={selectedCaso}
          onClose={handleCloseForm}
          onSave={handleSaveCaso}
        />
      </Box>
    </Container>
  );
};

export default CasosPage;
