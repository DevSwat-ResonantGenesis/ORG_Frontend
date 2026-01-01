# Project Archive & Restore System

## Overview

This system allows users to archive virtual folders (projects) from their active working tree while preserving them in Hash Sphere. Archived projects can only be restored by the user who archived them, using the Hash Sphere hash.

## How It Works

### 1. **Hash Sphere Storage**
- Projects are hashed and stored forever in the database
- Hash can be reversed/revealed to restore the project
- Hash is generated from project structure (file paths + content hashes)

### 2. **Archive Flow**
- User archives a project (virtual folder) from working tree
- All files in the project are marked as `is_archived = True`
- Project gets a Hash Sphere hash for restore
- Archived projects are **hidden** from active working tree
- Files remain in Hash Sphere for future reference

### 3. **Restore Flow**
- User requests restore by providing Hash Sphere hash
- System verifies user_id matches `archived_by_user_id` (security)
- Files are restored with a new project_id
- Project appears back in active working tree

## Database Schema

### CodeFile Model (Updated)
```python
is_archived: bool = False  # True if archived
archived_at: Optional[DateTime]  # When archived
archived_by_user_id: Optional[UUID]  # Who archived it
project_hash: Optional[str]  # Hash Sphere hash for restore
```

## API Endpoints

### Archive Project
```
POST /code/project/archive
{
  "project_id": "uuid",
  "project_hash": "optional-hash"  # Auto-generated if not provided
}

Response:
{
  "success": true,
  "message": "Project archived successfully",
  "project_hash": "sha256-hash",
  "archived_files_count": 10
}
```

### Restore Project
```
POST /code/project/restore
{
  "project_hash": "sha256-hash",
  "new_project_id": "optional-uuid"  # Auto-generated if not provided
}

Response:
{
  "success": true,
  "message": "Project restored successfully",
  "project_id": "new-uuid",
  "restored_files_count": 10
}
```

### List Files (Updated)
```
GET /code/project/files?project_id=uuid&include_archived=false

- By default, excludes archived projects (include_archived=false)
- Set include_archived=true to see archived projects
```

## Security

1. **User Isolation**: Only the user who archived can restore (checks `archived_by_user_id`)
2. **Organization Isolation**: Projects are scoped by `org_id`
3. **Hash Verification**: Hash must match exactly to restore

## Workflow

### Archive a Project
1. User right-clicks virtual folder in file tree
2. Selects "Archive Project"
3. System archives all files with Hash Sphere hash
4. Project disappears from active working tree
5. User receives hash for future restore

### Restore a Project
1. User provides Hash Sphere hash
2. System verifies user_id matches archived_by_user_id
3. System restores all files with new project_id
4. Project appears back in active working tree

## Benefits

1. **Clean Working Tree**: Archived projects don't clutter active workspace
2. **Hash Sphere Preservation**: All code patterns remain in Hash Sphere
3. **Selective Restore**: Only restore when needed (not automatic)
4. **User Control**: Users manage their own archived projects
5. **Security**: Only original user can restore their archived projects

## Next Steps

1. ✅ Backend archive/restore endpoints
2. ✅ Database schema updates
3. ⏳ Database migration (Alembic)
4. ⏳ Frontend API functions
5. ⏳ Frontend UI (Archive/Restore buttons)
6. ⏳ Archive management panel

