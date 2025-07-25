import React, { useState } from 'react';
import { Item } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { Gift } from 'lucide-react';

interface GiftQuantityModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item;
  onConfirm: (quantity: number) => void;
  isSubmitting?: boolean;
}

const GiftQuantityModal: React.FC<GiftQuantityModalProps> = ({
  isOpen,
  onClose,
  item,
  onConfirm,
  isSubmitting = false
}) => {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (quantity <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }
    
    if (quantity > item.quantity) {
      setError(`No hay suficiente stock. Disponible: ${item.quantity}`);
      return;
    }
    
    onConfirm(quantity);
    setQuantity(1);
    setError('');
  };

  const handleClose = () => {
    setQuantity(1);
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reducir Cantidad por Regalo"
      size="sm"
    >
      <form onSubmit={handleSubmit}>
        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
            <Gift className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {item.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Stock actual: {item.quantity} unidades
          </p>
        </div>

        <Input
          label="Cantidad a reducir"
          type="number"
          value={quantity.toString()}
          onChange={(e) => {
            setQuantity(parseInt(e.target.value) || 1);
            setError('');
          }}
          min="1"
          max={item.quantity}
          step="1"
          error={error}
          required
          fullWidth
        />

        <div className="mt-6 flex justify-center space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="success"
            isLoading={isSubmitting}
          >
            Confirmar Regalo
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GiftQuantityModal;