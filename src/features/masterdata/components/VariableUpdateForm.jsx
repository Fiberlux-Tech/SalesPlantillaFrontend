import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function VariableUpdateForm({ 
    editableConfig, 
    formInput, 
    setFormInput, 
    handleUpdateSubmit, 
    isLoading 
}) {
    // Handlers here only update local form state (formInput) using the setter passed from the parent.
    const onVariableChange = (value) => {
        setFormInput(prev => ({ ...prev, variable_name: value }));
    };

    const onValueChange = (e) => {
        setFormInput(prev => ({ ...prev, variable_value: e.target.value }));
    };

    const onCommentChange = (e) => {
        setFormInput(prev => ({ ...prev, comment: e.target.value }));
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">Update Variable</h2>
            
            <div className="flex space-x-4 items-end">
                
                {/* 1. Variable Select */}
                <div className="w-[160px] flex-shrink-0">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Variable</label>
                    <Select 
                        value={formInput.variable_name} 
                        onValueChange={onVariableChange}
                        className="w-full"
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona una variable" />
                        </SelectTrigger>
                        <SelectContent>
                            {editableConfig.map(config => (
                                <SelectItem key={config.name} value={config.name}>
                                    {config.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                
                {/* 2. Value Input */}
                <div className="w-[160px] flex-shrink-0">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                    <Input
                        type="number"
                        placeholder="Ingresa el valor"
                        value={formInput.variable_value}
                        onChange={onValueChange}
                    />
                </div>
                
                {/* 3. Comment Input */}
                <div className="flex-1 min-w-[150px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comentario</label>
                    <Input
                        type="text"
                        placeholder="Comentario opcional (máximo 50 caracteres)"
                        value={formInput.comment}
                        onChange={onCommentChange}
                        maxLength={50}
                    />
                </div>
                
                {/* 4. Submit Button */}
                <Button onClick={handleUpdateSubmit} disabled={isLoading}>
                    Update Variable
                </Button>
            </div>
        </div>
    );
}