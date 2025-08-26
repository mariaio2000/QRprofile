import React, { useState } from 'react';
import { Briefcase, Plus, X, Star } from 'lucide-react';
import { ProfileData, Service } from '../../types/profile';

interface ServicesEditorProps {
  profileData: ProfileData;
  onUpdate: (data: Partial<ProfileData>) => void;
}

const ServicesEditor: React.FC<ServicesEditorProps> = ({ profileData, onUpdate }) => {
  const [isAddingService, setIsAddingService] = useState(false);
  const [newService, setNewService] = useState({
    title: '',
    description: '',
    price: '',
    featured: false
  });

  const handleAddService = () => {
    if (newService.title && newService.description && newService.price) {
      const service: Service = {
        id: Date.now().toString(),
        ...newService
      };
      
      onUpdate({
        services: [...profileData.services, service]
      });
      
      setNewService({ title: '', description: '', price: '', featured: false });
      setIsAddingService(false);
    }
  };

  const handleRemoveService = (serviceId: string) => {
    onUpdate({
      services: profileData.services.filter(service => service.id !== serviceId)
    });
  };

  const handleToggleFeatured = (serviceId: string) => {
    onUpdate({
      services: profileData.services.map(service =>
        service.id === serviceId
          ? { ...service, featured: !service.featured }
          : service
      )
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-900 flex items-center">
          <Briefcase className="w-5 h-5 mr-2 text-primary-600" />
          Services & Offerings
        </h3>
        <button
          onClick={() => setIsAddingService(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service</span>
        </button>
      </div>

      <div className="space-y-4">
        {profileData.services.map((service) => (
          <div key={service.id} className="border border-border rounded-xl p-4 bg-surface">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-semibold text-text-900">{service.title}</h4>
                  {service.featured && (
                    <Star className="w-4 h-4 text-warning-600 fill-current" />
                  )}
                </div>
                <p className="text-text-700 text-sm mb-2">{service.description}</p>
                <p className="text-primary-600 font-semibold">{service.price}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleFeatured(service.id)}
                  className={`p-2 rounded-xl transition-all ${
                    service.featured
                      ? 'bg-warning-100 text-warning-600'
                      : 'bg-surface-muted text-text-400 hover:text-warning-600'
                  }`}
                  title="Toggle featured"
                >
                  <Star className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRemoveService(service.id)}
                  className="p-2 bg-danger-100 text-danger-600 rounded-xl hover:bg-danger-200 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isAddingService && (
        <div className="border border-border rounded-xl p-6 bg-surface">
          <h4 className="font-semibold text-text-900 mb-4">Add New Service</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-700 mb-2">Service Title</label>
              <input
                type="text"
                value={newService.title}
                onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                className="w-full px-4 py-3 border border-border rounded-xl focus:ring-4 focus:ring-ring focus:border-transparent transition-all bg-surface"
                placeholder="e.g., Web Design, Consultation"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-700 mb-2">Description</label>
              <textarea
                value={newService.description}
                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-border rounded-xl focus:ring-4 focus:ring-ring focus:border-transparent transition-all resize-none bg-surface"
                placeholder="Describe what you offer..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-700 mb-2">Price</label>
              <input
                type="text"
                value={newService.price}
                onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                className="w-full px-4 py-3 border border-border rounded-xl focus:ring-4 focus:ring-ring focus:border-transparent transition-all bg-surface"
                placeholder="e.g., $100/hour, $500/project"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                checked={newService.featured}
                onChange={(e) => setNewService({ ...newService, featured: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-border rounded focus:ring-ring"
              />
              <label htmlFor="featured" className="text-sm text-text-700">
                Mark as featured service
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleAddService}
                className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all"
              >
                Add Service
              </button>
              <button
                onClick={() => setIsAddingService(false)}
                className="px-4 py-2 text-text-700 hover:text-text-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesEditor;