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
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
          Services & Offerings
        </h3>
        <button
          onClick={() => setIsAddingService(true)}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service</span>
        </button>
      </div>

      <div className="space-y-4">
        {profileData.services.map((service) => (
          <div key={service.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-semibold text-gray-900">{service.title}</h4>
                  {service.featured && (
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                <p className="text-blue-600 font-semibold">{service.price}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleFeatured(service.id)}
                  className={`p-2 rounded-lg transition-all ${
                    service.featured
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-gray-100 text-gray-400 hover:text-yellow-600'
                  }`}
                  title="Toggle featured"
                >
                  <Star className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRemoveService(service.id)}
                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {isAddingService && (
          <div className="border-2 border-dashed border-violet-300 rounded-lg p-4 bg-violet-50">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Service title"
                value={newService.title}
                onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              <textarea
                placeholder="Service description"
                value={newService.description}
                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
              />
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Price (e.g., $150/hour)"
                  value={newService.price}
                  onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newService.featured}
                    onChange={(e) => setNewService({ ...newService, featured: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Featured</span>
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleAddService}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  Add Service
                </button>
                <button
                  onClick={() => setIsAddingService(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesEditor;