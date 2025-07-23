import React, { useState } from 'react';
import { Skill } from '../types';
import { formatCurrency, getCurrencySymbol, getCurrencyForLocale, parseCurrencyInput } from '../utils/currency';

interface SkillsListProps {
  skills: Skill[];
  onAddSkill: (skill: Partial<Skill>) => void;
}

const SkillsList: React.FC<SkillsListProps> = ({ skills, onAddSkill }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newSkill, setNewSkill] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
    duration: 60,
    location: '',
    level: 'Beginner',
  });

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSkill(newSkill);
    setNewSkill({
      title: '',
      description: '',
      category: '',
      price: 0,
      duration: 60,
      location: '',
      level: 'Beginner',
    });
    setShowAddForm(false);
  };

  const SkillForm: React.FC<{ skill: any; onSubmit: (e: React.FormEvent) => void; onCancel: () => void }> = ({ skill, onSubmit, onCancel }) => (
    <form onSubmit={onSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Skill Title</label>
          <input
            className="form-input"
            type="text"
            value={skill.title}
            onChange={(e) => setNewSkill({ ...skill, title: e.target.value })}
            required
            placeholder="e.g., Guitar Lessons"
          />
        </div>
        <div>
          <label className="form-label">Category</label>
          <select
            className="form-select"
            value={skill.category}
            onChange={(e) => setNewSkill({ ...skill, category: e.target.value })}
            required
          >
            <option value="">Select category</option>
            <option value="Music">Music</option>
            <option value="Technology">Technology</option>
            <option value="Arts">Arts</option>
            <option value="Sports">Sports</option>
            <option value="Language">Language</option>
            <option value="Cooking">Cooking</option>
            <option value="Business">Business</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="form-label">Description</label>
        <textarea
          className="form-input"
          value={skill.description}
          onChange={(e) => setNewSkill({ ...skill, description: e.target.value })}
          rows={3}
          placeholder="Describe what you'll teach and what students will learn..."
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="form-label">Price per Session</label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">{getCurrencySymbol(getCurrencyForLocale(navigator.language))}</span>
            <input
              className="form-input pl-8"
              type="number"
              value={skill.price}
              onChange={(e) => setNewSkill({ ...skill, price: parseCurrencyInput(e.target.value) })}
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>
        <div>
          <label className="form-label">Duration (minutes)</label>
          <input
            className="form-input"
            type="number"
            value={skill.duration}
            onChange={(e) => setNewSkill({ ...skill, duration: parseInt(e.target.value) || 60 })}
            min="15"
            step="15"
            required
          />
        </div>
        <div>
          <label className="form-label">Level</label>
          <select
            className="form-select"
            value={skill.level}
            onChange={(e) => setNewSkill({ ...skill, level: e.target.value })}
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="form-label">Location</label>
        <input
          className="form-input"
          type="text"
          value={skill.location}
          onChange={(e) => setNewSkill({ ...skill, location: e.target.value })}
          placeholder="e.g., San Francisco, CA or Online"
        />
      </div>
      
      <div className="flex justify-between">
        <button type="submit" className="btn-primary">
          Save Skill
        </button>
        <button type="button" onClick={onCancel} className="btn-cancel">
          Cancel
        </button>
      </div>
    </form>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">My Skills</h3>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            Add New Skill
          </button>
        )}
      </div>
      
      {showAddForm && (
        <div className="mb-6">
          <SkillForm
            skill={newSkill}
            onSubmit={handleAddSkill}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}
      
      {skills.length > 0 ? (
        <div className="space-y-4">
          {skills.map((skill) => (
            <div key={skill.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">{skill.title}</h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {skill.category}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      skill.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {skill.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{skill.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="font-medium text-green-600">{formatCurrency(skill.price)}/session</span>
                    <span>{skill.duration} min</span>
                    <span>{skill.location}</span>
                    {skill.level && <span>Level: {skill.level}</span>}
                    {skill.rating && skill.rating > 0 && (
                      <span className="flex items-center">
                        ⭐ {skill.rating.toFixed(1)} ({skill.review_count || 0} reviews)
                      </span>
                    )}
                  </div>
                </div>
                
                {/* TODO: Implement edit/delete functionality
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => console.log('Edit skill:', skill.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => console.log('Delete skill:', skill.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
                */}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg mb-2">No skills added yet</p>
          <p>Start by adding your first skill to share with the community!</p>
        </div>
      )}
    </div>
  );
};

export default SkillsList;